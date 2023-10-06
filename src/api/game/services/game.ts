/**
 * game service
 */

import { factories } from '@strapi/strapi';
import {JSDOM} from 'jsdom'
import axios from 'axios'
import slugify from 'slugify';

const gameService="api::game.game";
const publisherService="api::publisher.publisher";
const developerService="api::developer.developer";
const categoryService="api::category.category";
const platformService="api::platform.platform";

async function getGameInfo(slug) {
  const gogSlug = slug.replaceAll('-','_').toLowerCase();

  const body = await axios.get(`https://www.gog.com/game/${gogSlug}`);

  const dom = new JSDOM(body.data);

  const rowDescription = dom.window.document.querySelector(".description");

  const description = rowDescription.innerHTML;

  const shortDescription = rowDescription.textContent.slice(0,160);

  const ratingElement = dom.window.document.querySelector(
    ".age-restrictions__icon use"
  );

  return{
    description,
    shortDescription,
    rating: ratingElement
        ? ratingElement
            .getAttribute("xlink:href")
            .replace(/_/g, "")
            .replace("#", "")
        : "BR0",
  }
}

async function createManyToManyData(products){
  const developersSet= new Set();
  const publishersSet = new Set();
  const categoriesSet = new Set();
  const platformsSet = new Set();

  products.forEach(product => {
    const {developers,publishers, genres, operatingSystems}= product;

    genres?.forEach(({name})=>{
      categoriesSet.add(name);
    })
    operatingSystems?.forEach((item)=>{
      categoriesSet.add(item);
    })
    developers?.forEach((item)=>{
      categoriesSet.add(item);
    })
    publishers?.forEach((item)=>{
      categoriesSet.add(item);
    })

    const createCall=(set, entityName)=>
    Array.from(set).map((name)=>create(name,entityName))
    return Promise.all([
      ...createCall(developersSet,developerService),
      ...createCall(publishersSet,publisherService),
      ...createCall(categoriesSet,categoryService),
      ...createCall(platformsSet,platformService),
    ])
  });

}

async function getByName(name, entityService) {
  try {
    const item = await strapi.service(entityService).find({
      filters: { name },
    });

    return item.results.length > 0 ? item.results[0] : null;
  } catch (error) {
    console.log("getByName:", Exception(error));
  }
}

async function create(name, entityService) {
  try {
    const item = await getByName(name, entityService);

    if (!item) {
      await strapi.service(entityService).create({
        data: {
          name,
          slug: slugify(name, { strict: true, lower: true }),
        },
      });
    }
  } catch (error) {
    console.log("create:", Exception(error));
  }
}

export default factories.createCoreService('api::game.game',()=>({
  async populate(params){
    const gogApiUrl=`https://catalog.gog.com/v1/catalog?limit=48&order=desc%3Atrending`;

    const {
      data:{products},
    } = await axios.get(gogApiUrl);
    await createManyToManyData([products[0],products[1]]);
  }

}));
function Exception(error: any): any {
  throw new Error('Function not implemented.');
}

