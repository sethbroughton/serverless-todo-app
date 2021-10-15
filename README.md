# serverless-todo-app

To deploy:

1. Starting in the root directory run <br>
```cd infrastructure``` <br>
```cdk deploy InfrastructureStack```

2. After it has completed, navigate to your AWS API Gateway console.  Select "API Keys" and select "todo-app-api-key-v3".  Under API key, select "Show". Copy your api key. 
3. Using the .env.sample file as a template, make a new file called .env
4. In the .env file, replace the placeholder api key with the one you copied from the console. <br>
``` API_KEY=ADD_YOUR_API_KEY_HERE ```

5. Returning to the command line, in the infrastructure folder run  <br>
```cdk deploy WebsiteStack```

If you would like to test the backend using your api key, please use this collection in Postman. <br>
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/11280759-a52d45b0-f628-45f5-abed-0ee92a84f2f3?action=collection%2Ffork&collection-url=entityId%3D11280759-a52d45b0-f628-45f5-abed-0ee92a84f2f3%26entityType%3Dcollection%26workspaceId%3D1f01fabf-5acf-4e49-aead-1485c7c3dafc)

Sample Site: https://d2lzu2s2ab91k6.cloudfront.net/


