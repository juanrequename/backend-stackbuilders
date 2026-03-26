import { Request, Response, NextFunction } from 'express';
import crawlerService from '../services/crawler.service';
import { CrawlerFilterType } from '../types/crawler';

class CrawlerController {
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
      const sourceEntries = await crawlerService.scrape(30);
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
