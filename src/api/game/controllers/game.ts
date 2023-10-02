import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::game.game',({strapi})=>({
  async populate(ctx) {
    console.log("RODANDO NO SERVER");
    await strapi.service("api::game.game").populate(ctx.query);
    ctx.send("FINALIZADO NO CLIENT");
  },
}));


