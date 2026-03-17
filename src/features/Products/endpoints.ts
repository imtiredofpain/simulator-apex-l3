import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints('products');
export const productsEndpoints = E((e) => ({
  list: e.get('list', 'v1/products').tag('products:list'),
  byId: e.get('byId', 'v1/products/:id').tag('products:byId'),
  create: e
    .post('create', 'v1/products')
    .tag('products:create')
    .deps([tag('products:list')]),
  update: e
    .patch('update', 'v1/products/:id')
    .deps([tag('products:byId'), tag('products:list')]),
}));
