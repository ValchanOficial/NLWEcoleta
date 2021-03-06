import { Request, Response } from 'express';
import knex from '../database/connection';

import { ADDRESS } from '../config/config';

class ItemsController {
  async index (request: Request, response: Response) {
    const items = await Promise.resolve(knex('items').select('*'));
  
    const serializedItems = items.map(item => {
      return { 
        id: item.id,
        title: item.title,
        image_url: `http://${ADDRESS}:3333/uploads/${item.image}`
      };
    });
  
    return response.json(serializedItems);
  }
}

export default ItemsController;
