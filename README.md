# rails-api-template
A simple rails-api template to get up and running with a rails + doorkeeper + devise + rspec

To run this simply download and do the following in a terminal   
`rails new your-app-name-api -m ~/api-template.rb --api`

I also have a file that sets the following commands by default   
`-d postgresql`
`--skip-test` Because I install rspec in the template

This comes will install access tokens and refresh tokens for your front end. I advise to use [Kitsu](https://github.com/wopian/kitsu/tree/master/packages/kitsu) to intercat with this api.
