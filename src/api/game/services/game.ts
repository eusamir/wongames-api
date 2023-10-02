/**
 * game service
 */

import { factories } from '@strapi/strapi';
import axios from 'axios'

export default factories.createCoreService('api::game.game',()=>({
  async populate(params){
    const gogApiUrl=`https://www.gog.com/games/ajax/filtered?mediaType=game`;

    const {
      data:{products},
    } = await axios.get(gogApiUrl);
    console.log(products);
  }

}));
