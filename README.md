# rails-api-template
A simple rails-api template to get up and running with a rails + [doorkeeper](https://github.com/doorkeeper-gem/doorkeeper) + [devise](https://github.com/plataformatec/devise) + [jsonapi-resources](https://github.com/cerebris/jsonapi-resources) + [rspec](https://github.com/rspec/rspec-rails) + rolify (optional)

To run the standard template download and do the following in terminal   
`rails new your-app-name-api -m ~/api-template.rb --api`

To run the rolify template simply download run the following in terminal   
`rails new your-app-name-api -m ~/api-template-rolify.rb --api`

Take into account that I have these settings by default   
`-d postgresql` Because I prefer postgres always   
`--skip-test` Because I install rspec in the template   

So if you dont have these by default use this command instead      
`rails new your-app-name-api -m ~/api-template.rb --api -d postgresql --skip-test`   

Doorkeeper will set access token expiration to 1 hour and will also return a refresh token when requesting access (log in) on your front end. I advise to use [Kitsu](https://github.com/wopian/kitsu/tree/master/packages/kitsu) to interact with this api and formulate a strategy on your front end to store and request another access token using the refresh token stored. I created a basic template with react that works with the rails-api-rolify template.
