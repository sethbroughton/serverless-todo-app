# serverless-todo-app

To deploy:

1. Starting in the root directory run <br>
```cd infrastructure``` <br>
```cdk deploy InfrastructureStack```

2. After it has completed, navigate to your AWS API Gateway console.  Select "API Keys" and select "todo-app-api-key-v3".  Under API key, select "Show". Copy your api key. 
3. Using the .env.sample file as a template, make a new file called .env
4. Replace the placeholder api key with the one you copied from the console. 

5. Returning to the command line, in the infrastructure folder run  <br>
```cdk deploy WebsiteStack```


Sample: https://d2lzu2s2ab91k6.cloudfront.net/


