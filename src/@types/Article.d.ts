/**
 * @swagger
 *  definitions:
 *    ArticleArray:
 *      type: array
 *      items:
 *        $ref: '#/definitions/Article'
 *    Article:
 *      type: object
 *      required:
 *        - url
 *        - title
 *        - date
 *        - source
 *      properties:
 *        url:
 *          type: string
 *        title:
 *          type: string
 *        date:
 *          type: datetime
 *        source:
 *          type: string
 *        author:
 *          type: string
 *        imageUrl:
 *          type: string
 *      example:
 *         url: https://eng.uber.com/piranha/
 *         title: Introducing Piranha - An Open Source Tool to Automatically Delete Stale Code
 *         date: 2020-03-17T08:30:25+00:00
 *         source: uber
 *         author: Name Name
 *         imageUrl: https://1fykyq3mdn5r21tpna3wkdyi-wpengine.netdna-ssl.com/wp-content/uploads/2020/03/Header-Piranha-696x298.jpg
 *
 */
export interface Article {
  url: string;
  title: string;
  author?: string;
  imageUrl?: string;
  date: Date;
  source: string;
  sourceIconUrl?: string
}
