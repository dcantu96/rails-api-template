gem 'devise'
gem 'doorkeeper'
gem 'jsonapi-resources'
gem 'rack-cors'
gem 'pry'
gem 'rolify'

gem_group :development, :test do
  gem 'rspec-rails'
  gem 'ffaker'
end

run 'bundle install'
rails_command 'db:drop'
rails_command 'db:create'
puts 'Init rspec install'
generate 'rspec:install'
puts 'Finished installing rspec'

puts 'Init devise install'
generate 'devise:install'
generate :devise, 'user first_name:string last_name:string'
rails_command 'db:migrate'
environment 'config.action_mailer.default_url_options = { host: "localhost", port: 8080 }', env: 'development'

generate 'doorkeeper:install'
run 'bundle exec rails generate doorkeeper:migration'
index_migration_array = Dir['db/migrate/*_create_doorkeeper_tables.rb']
index_migration_file = index_migration_array.first
in_root do 
  insert_into_file index_migration_file, "\n    add_foreign_key :oauth_access_grants, :users, column: :resource_owner_id", after: "# Uncomment below to ensure a valid reference to the resource owner's table\n    add_foreign_key :oauth_access_tokens, :users, column: :resource_owner_id", after: "# Uncomment below to ensure a valid reference to the resource owner's table"
  gsub_file index_migration_file, 't.references :application,    null: false', 't.references :application'
end

rails_command 'db:migrate'


puts 'Init rolify install'
generate 'rolify Role User'
index_migration_array = Dir['db/migrate/*_rolify_create_roles.rb']
index_migration_file = index_migration_array.first
in_root do 
  insert_into_file index_migration_file,
                   '[6.0]',
                   after: 'class RolifyCreateRoles < ActiveRecord::Migration'
end
rails_command 'db:migrate'
file 'app/models/user.rb', <<-CODE, force: true
class User < ApplicationRecord
  rolify
  devise :database_authenticatable, :registerable,
        :recoverable, :rememberable, :validatable
  has_many :access_grants,
          class_name: 'Doorkeeper::AccessGrant',
          foreign_key: :resource_owner_id,
          dependent: :delete_all # or :destroy if you need callbacks
  has_many :access_tokens,
          class_name: 'Doorkeeper::AccessToken',
          foreign_key: :resource_owner_id,
          dependent: :delete_all # or :destroy if you need callbacks
  validates :first_name, presence: true
  validates :last_name, presence: true

  def generate_password_token!
    self.reset_password_token = generate_token
    self.reset_password_sent_at = Time.now.utc
    save!
  end

  def password_token_valid?
    (self.reset_password_sent_at + 4.hours) > Time.now.utc
  end

  def self.admins
    User.where(admin: true)
  end

  def role
    @role ||= roles.first.present? ? roles.first : nil
  end

  private

  def generate_token
    SecureRandom.hex(10)
  end
end  
CODE

puts 'Finish rolify install'
puts 'Finsh devise install'

file 'config/initializers/doorkeeper.rb', <<-CODE, force: true
Doorkeeper.configure do
  orm :active_record
  api_only

  resource_owner_from_credentials do |routes|
    user = User.find_for_database_authentication(email: params[:email])
    if user&.valid_for_authentication? { user.valid_password?(params[:password]) } && user&.active_for_authentication?
      request.env['warden'].set_user(user, scope: :user, store: false)
      user
    end
  end

  skip_authorization do
    true
  end

  access_token_expires_in 1.hour
  use_refresh_token
  grant_flows %w(authorization_code implicit password client_credentials)
end
CODE

file 'config/routes.rb', <<-CODE, force: true
Rails.application.routes.draw do
  scope 'api' do
    scope 'v1' do
      get '/me', to: 'application#me', defaults: { format: :json }
      use_doorkeeper do
        # No need to register client application
        skip_controllers :applications, :authorized_applications
      end
    end
  end
  devise_for :users, path: '/api/v1/users', defaults: { format: :json }, controllers: {
    registrations: 'api/v1/users/registrations',
  }, skip: [:sessions]
  namespace :api do
    namespace :v1, defaults: { format: :json } do
      resources :reset_passwords, only: [:create]
      post 'reset_pass', controller: :reset_passwords, action: :reset
      # jsonapi_resources :users, only: [:index, :show]
      post :remove_roles, controller: :users, action: :remove_roles
      post :assign_roles, controller: :users, action: :assign_roles
    end
  end
end
CODE

file 'config/initializers/cors.rb', <<-CODE, force: true
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '/api/v1/*',
      # headers: :any,
      # methods: [ :options ]
      headers: %w(Authorization),
      methods: :any,
      expose: %w(Authorization),
      max_age: 600
  end
end
CODE

run 'mkdir -p app/resources/api/v1'
run 'mkdir -p app/controllers/api/v1/users'

file 'app/controllers/application_controller.rb', <<-CODE, force: true
class ApplicationController < ActionController::API
  respond_to :json
  include JSONAPI::ActsAsResourceController
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :doorkeeper_authorize!, only: [:me]
  before_action :set_current_user, only: [:me]

  def me
    render json: {
      data: {
        user: current_user.as_json,
        role: current_user.role
      }
    }
  end

  def context
    { current_user: current_user.as_json }
  end

  protected

  def configure_permitted_parameters
    attributes = [:first_name, :last_name, :email]
    devise_parameter_sanitizer.permit(:sign_up, keys: attributes)
    devise_parameter_sanitizer.permit(:account_update, keys: attributes)
  end
    
  private

  def set_current_user
    @current_user ||= current_resource_owner
  end

  def current_resource_owner
    User.find(doorkeeper_token.resource_owner_id) if doorkeeper_token
  end
end
CODE

file 'app/controllers/api/v1/users/registrations_controller.rb', <<-CODE, force: true
class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  # POST /resource
  def create
    build_resource(sign_up_params)
    resource.save
    if resource.persisted?
      if resource.active_for_authentication?
        # set_flash_message! :notice, :signed_up
        # To avoid login comment out sign_up method
        # sign_up(resource_name, resource)
        render json: resource # , location: after_sign_up_path_for(resource)
      else
        expire_data_after_sign_in!
        render json: resource # , location: after_inactive_sign_up_path_for(resource)
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      respond_with resource
    end
  end
end
CODE

file 'app/controllers/api/v1/reset_passwords_controller.rb', <<-CODE, force: true
class Api::V1::ResetPasswordsController < ApplicationController
  def create
    user = User.find_by_email(user_params)
    if user.present?
      user.generate_password_token!
      UserMailer.send_reset_password_email(user).deliver
      render json: {status: 'ok'}, status: :ok
    else
      render json: {error: ['Email address not found. Please check and try again.']}, status: :not_found
    end
  end

  def reset
    user = User.find_by(reset_password_token: params[:token].to_s)

    if user.present? && user.password_token_valid?
      if user.reset_password(params[:password], params[:password_confirmation])
        render json: {status: 'ok'}, status: :ok
      else
        render json: {error: user.errors.full_messages}, status: :unprocessable_entity
      end
    else
      render json: {error:  ['Link not valid or expired. Try generating a new link.']}, status: :not_found
    end
  end

  def update
    if !params[:password].present?
      render json: {error: 'Password not present'}, status: :unprocessable_entity
      return
    end
  
    if current_user.reset_password(params[:password])
      render json: {status: 'ok'}, status: :ok
    else
      render json: {errors: current_user.errors.full_messages}, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:email)
  end
end  
CODE

file 'app/controllers/api/v1/users_controller.rb', <<-CODE, force: true
class Api::V1::UsersController < ApplicationController
  before_action :doorkeeper_authorize!
  before_action :set_current_user, only: [:index, :remove_roles, :assign_roles]

  def index
    if current_user.has_role? :admin
      super
    else
      render json: :unauthorized, status: 403
    end
  end

  def remove_roles
    if current_user.has_role? :admin
      user = User.find(params['data']['attributes']['user_id'])
      user.remove_role params['data']['attributes']['role_name'].to_sym
      render json: :ok, status: 200
    else
      render json: :unauthorized, status: 403
    end
  end

  def assign_roles
    if current_user.has_role? :admin
      user = User.find(params['data']['attributes']['user_id'])
      user.add_role params['data']['attributes']['role_name'].to_sym
      render json: :ok, status: 200
    else
      render json: :unauthorized, status: 403
    end
  end
end
CODE

gsub_file 'config/puma.rb', '3000', '8080'

puts 'This installation comes with refresh token setup and 1 hour of token expiration AND USER ROLES'
puts 'Finish :)'

#   git :init
#   git add: "."
#   git commit: %Q{ -m 'Initial commit' }
