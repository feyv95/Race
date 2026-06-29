import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Link from 'flarum/common/components/Link';

export default class LeaderboardPage extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = true;
    this.rows = [];
    this.load();
  }

  async load() {
    this.loading = true;
    m.redraw();
    try {
      const res = await app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/racing/leaderboard` });
      this.rows = res.leaderboard || [];
    } catch (e) {}
    this.loading = false;
    m.redraw();
  }

  view() {
    const medals = ['🥇', '🥈', '🥉'];

    return (
      <div className="RacingPage LeaderboardPage">
        <div className="RacingPage-header">
          <h1>🏆 Leaderboard</h1>
          <div className="RacingPage-nav">
            <Link href={app.route('racing.index')} className="Button">🏟 Lobby</Link>
          </div>
        </div>

        {this.loading ? <LoadingIndicator /> : (
          <div className="RacingPanel">
            <table className="LeaderboardTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Driver</th>
                  <th>Wins</th>
                  <th>Races</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {this.rows.map((row, i) => (
                  <tr className={i < 3 ? 'LeaderboardTable-top' : ''}>
                    <td>{medals[i] || (i + 1)}</td>
                    <td><strong>{row.username}</strong></td>
                    <td>{row.wins}</td>
                    <td>{row.total_races}</td>
                    <td>{row.win_rate}%</td>
                  </tr>
                ))}
                {this.rows.length === 0 && (
                  <tr><td colspan="5">No races yet. Be the first!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}
