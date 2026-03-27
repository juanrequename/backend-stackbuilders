import { Request, Response, NextFunction } from 'express';
import crawlerService from '../services/crawler.service';
import { CrawlerFilterType } from '../types/crawler';
import { environment } from '../config/environment';
import { AppError } from '../errors/appError';

class CrawlerController {
  /**
   * @swagger
   * /crawler/usage:
   *   get:
   *     summary: Get usage logs for crawler requests
   *     tags: [Crawler]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 500
   *         description: Max number of usage logs to return (default 50)
   *     responses:
   *       200:
   *         description: Usage log entries
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         logs:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/UsageLog'
   *       400:
   *         description: Invalid query
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async usage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const defaultLimit = 50;
    const maxLimit = 100;
    const { limit } = req.query as { limit?: string };

    try {
      const parsedLimit = limit === undefined ? defaultLimit : Number(limit);

      if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
        throw new AppError('limit must be a positive number', 400, 'VALIDATION_ERROR');
      }

      if (limit !== undefined && !Number.isInteger(parsedLimit)) {
        throw new AppError('limit must be an integer', 400, 'VALIDATION_ERROR');
      }

      const normalizedLimit = Math.min(parsedLimit, maxLimit);
      const logs = await crawlerService.getUsageLogs(normalizedLimit);

      res.status(200).json({
        success: true,
        data: {
          logs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /crawler/filter:
   *   post:
   *     summary: Filter Hacker News entries by title length
   *     tags: [Crawler]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - filterType
   *             properties:
   *               filterType:
   *                 type: string
   *                 enum: [more_than_five_words, five_or_less_words, none]
   *     responses:
   *       200:
   *         description: Filtered entries
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         entries:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/HnEntry'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async filter(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startedAt = Date.now();
    const { filterType } = req.body as {
      filterType: CrawlerFilterType;
    };

    try {
      // Use provided limit when present, otherwise let service use its default from config
      const sourceEntries = await crawlerService.scrape(environment.hnDefaultLimit);
      const filtered = crawlerService.applyFilter(filterType, sourceEntries);
      const durationMs = Date.now() - startedAt;

      await crawlerService.logUsage({
        requestedAt: new Date(),
        filterType,
        entryCount: sourceEntries.length,
        resultCount: filtered.length,
        durationMs,
        status: 'success',
      });

      res.status(200).json({
        success: true,
        data: {
          entries: filtered,
        },
      });
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      try {
        await crawlerService.logUsage({
          requestedAt: new Date(),
          filterType: filterType ?? 'none',
          durationMs,
          status: 'error',
        });
      } catch {
        // ignore logging failure
      }

      next(error);
    }
  }
}

export default new CrawlerController();
