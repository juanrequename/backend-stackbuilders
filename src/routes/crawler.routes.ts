import { Router } from 'express';
import crawlerController from '../controllers/crawler.controller';
import { makeValidator } from '../middleware/validate.middleware';
import { filterCrawlerSchema } from '../middleware/schemas/crawler.schema';

const router = Router();

router.post(
  '/filter',
  makeValidator(filterCrawlerSchema),
  crawlerController.filter.bind(crawlerController)
);

export default router;
