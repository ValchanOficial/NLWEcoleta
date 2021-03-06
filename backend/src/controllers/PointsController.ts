import { Request, Response } from 'express';
import knex from '../database/connection';
import { ADDRESS } from '../config/config';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await Promise.resolve(knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*'));

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://${ADDRESS}:3333/uploads/${point.image}`
      };
    });
    return response.json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const pointValue = await Promise.resolve(knex('points').where('id', id).first());

    if (!pointValue) {
      return response.status(400).json({ message: 'Point not found!' });
    }

    const items = await Promise.resolve(knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title'));

    const point = {
      ...pointValue,
      image_url: `http://${ADDRESS}:3333/uploads/${pointValue.image}`
    };

    return response.json({ point, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
  
    const trx = await knex.transaction();
  
    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    const insertedIds = await Promise.resolve(trx('points').insert(point));
  
    const point_id = insertedIds[0];
  
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id
        };
      });
  
    try {
      await Promise.resolve(trx('point_items').insert(pointItems));
      await Promise.resolve(trx.commit());
    } catch (error) {
      await Promise.resolve(trx.rollback());
      return response.status(400).json({ message: 'Falha na inserção na tabela point_items, verifique se os items informados são válidos' })
    }

    return response.status(201).json({ id: point_id, ...point, });
  }
}

export default PointsController;
