import { parseHnEntries } from '../hnParser';

describe('parseHnEntries', () => {
  it('parses entries with points and comments', () => {
    const html = `
      <table>
        <tr class="athing" id="1">
          <td class="title"><span class="rank">1.</span></td>
          <td class="title">
            <span class="titleline"><a href="https://example.com/1">First story</a></span>
          </td>
        </tr>
        <tr>
          <td class="subtext">
            <span class="score" id="score_1">100 points</span>
            <a href="item?id=1">50 comments</a>
          </td>
        </tr>
        <tr class="athing" id="2">
          <td class="title"><span class="rank">2.</span></td>
          <td class="title">
            <span class="titleline"><a href="https://example.com/2">Second story</a></span>
          </td>
        </tr>
        <tr>
          <td class="subtext">
            <span class="score" id="score_2">0 points</span>
            <a href="item?id=2">discuss</a>
          </td>
        </tr>
      </table>
    `;

    const entries = parseHnEntries(html, 30);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      number: 1,
      title: 'First story',
      points: 100,
      comments: 50,
    });
    expect(entries[1]).toEqual({
      number: 2,
      title: 'Second story',
      points: 0,
      comments: 0,
    });
  });
});
