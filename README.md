# rails-api-template
A simple rails-api template to get up and running with a rails + [doorkeeper](https://github.com/doorkeeper-gem/doorkeeper) + [devise](https://github.com/plataformatec/devise) + [jsonapi-resources](https://github.com/cerebris/jsonapi-resources) + [rspec](https://github.com/rspec/rspec-rails)

To run this simply download and do the following in a terminal   
`rails new your-app-name-api -m ~/api-template.rb --api`

I also have a file that sets the following commands by default   
`-d postgresql`
`--skip-test` Because I install rspec in the template

So if you dont have these by default add them to the command like so   
`rails new your-app-name-api -m ~/api-template.rb --api -d postgresql --skip-test`

Doorkeeper will set access token expiration to 1 hour and will also return a refresh token when requesting access (log in) on your front end. I advise to use [Kitsu](https://github.com/wopian/kitsu/tree/master/packages/kitsu) to interact with this api and formulate a strategy on your front end to store and request another access token using the refresh token stored. I will upload this strategy here maybe when I have more time. I will be using react as my front end.
