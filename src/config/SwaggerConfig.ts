import swaggerJSDoc from "swagger-jsdoc";

function getSwaggerOption(port: number) {
  return {
    swaggerDefinition: {
      info: {
        title: 'News aggregator API',
        version: '1.0.0',
        description: 'Get articles from mutitple tech blogs.',
        license: {
          name: 'MIT',
          url: 'https://choosealicense.com/licenses/mit/'
        },
        contact: {
          name: 'Christophe Ha',
          url: 'http://hashcode.dev',
          email: 'christophe@hashcode.dev'
        }
      },
      servers: [{
        url: `http://localhost:${port}/`
      }]
    },
    apis: ['./out/index.js', './src/@types/Article.d.ts', './src/helpers/WebsiteCategories.ts']
  };
}
export const swaggerDocs = (port: number) => swaggerJSDoc(getSwaggerOption(port));