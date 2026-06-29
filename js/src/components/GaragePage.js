import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Link from 'flarum/common/components/Link';

export default class GaragePage extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = true;
    this.cars = [];
    this.balance = 0;
    this.load();
  }

  async load() {
    this.loading = true;
    m.redraw();
    try {
      const res = await app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/racing/garage` });
      this.cars = res.cars || [];
      this.balance = res.balance || 0;
    } catch (e) {}
    this.loading = false;
    m.redraw();
  }

  view() {
    return (
      <div className="RacingPage GaragePage">
        <div className="RacingPage-header">
          <h1>🚗 My Garage</h1>
          <div className="RacingPage-nav">
            <Link href={app.route('racing.index')} className="Button">🏟 Lobby</Link>
            <Link href={app.route('racing.shop.page')} className="Button Button--primary">🏪 Buy Cars</Link>
            <span className="RacingPage-balance">💰 {this.balance} coins</span>
          </div>
        </div>

        {this.loading ? (
          <LoadingIndicator />
        ) : this.cars.length === 0 ? (
          <div className="RacingPanel">
            <p>Your garage is empty! <Link href={app.route('racing.shop.page')}>Visit the shop</Link> to buy your first car.</p>
            <p>💡 Tip: You earn <strong>5 coins</strong> for every post you make on the forum!</p>
          </div>
        ) : (
          <div className="CarGrid">
            {this.cars.map(car => (
              <div className="CarCard" style={`--car-color: ${car.color}`}>
                <div className="CarCard-emoji">{car.emoji}</div>
                <div className="CarCard-name">{car.name}</div>
                <span className={`Rarity Rarity--${car.rarity}`}>{car.rarity}</span>
                <div className="CarCard-stats">
                  <div className="StatBar">
                    <span>Speed</span>
                    <div className="StatBar-bar"><div style={`width:${car.speed}%`}></div></div>
                    <span>{car.speed}</span>
                  </div>
                  <div className="StatBar">
                    <span>Accel</span>
                    <div className="StatBar-bar"><div style={`width:${car.acceleration}%`}></div></div>
                    <span>{car.acceleration}</span>
                  </div>
                  <div className="StatBar">
                    <span>Handling</span>
                    <div className="StatBar-bar"><div style={`width:${car.handling}%`}></div></div>
                    <span>{car.handling}</span>
                  </div>
                  <div className="StatBar">
                    <span>Luck</span>
                    <div className="StatBar-bar"><div style={`width:${car.luck}%`}></div></div>
                    <span>{car.luck}</span>
                  </div>
                </div>
                <div className="CarCard-record">
                  🏁 {car.races_won}W / {car.races_total - car.races_won}L
                  {car.races_total > 0 && ` · ${car.win_rate}% win rate`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
