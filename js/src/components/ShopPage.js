import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Link from 'flarum/common/components/Link';

export default class ShopPage extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = true;
    this.cars = [];
    this.balance = 0;
    this.buying = null;
    this.load();
  }

  async load() {
    this.loading = true;
    m.redraw();
    try {
      const res = await app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/racing/shop` });
      this.cars = res.cars || [];
      this.balance = res.balance || 0;
    } catch (e) {}
    this.loading = false;
    m.redraw();
  }

  async buyCar(carId) {
    this.buying = carId;
    m.redraw();
    try {
      const res = await app.request({
        method: 'POST',
        url: `${app.forum.attribute('apiUrl')}/racing/garage/buy`,
        body: { car_catalog_id: carId },
      });
      app.alerts.show({ type: 'success' }, res.message || 'Car purchased!');
      this.balance = res.balance;
      await this.load();
    } catch (e) {
      const err = e?.response?.errors?.[0]?.detail || 'Purchase failed';
      app.alerts.show({ type: 'error' }, err);
    }
    this.buying = null;
    m.redraw();
  }

  view() {
    return (
      <div className="RacingPage ShopPage">
        <div className="RacingPage-header">
          <h1>🏪 Car Shop</h1>
          <div className="RacingPage-nav">
            <Link href={app.route('racing.index')} className="Button">🏟 Lobby</Link>
            <Link href={app.route('racing.garage.page')} className="Button">🚗 Garage</Link>
            <span className="RacingPage-balance">💰 {this.balance} coins</span>
          </div>
        </div>

        <div className="RacingPanel RacingPanel--info">
          <strong>💡 Earn coins:</strong> +5 per post you write on the forum.
          New members start with 50 coins.
        </div>

        {this.loading ? <LoadingIndicator /> : (
          <div className="CarGrid">
            {this.cars.map(car => (
              <div className={`CarCard ${car.owned ? 'CarCard--owned' : ''}`} style={`--car-color: ${car.color}`}>
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
                <div className="CarCard-price">💰 {car.price} coins</div>
                {car.owned ? (
                  <span className="CarCard-owned-badge">✓ Owned</span>
                ) : (
                  <Button
                    className="Button Button--primary CarCard-buy"
                    loading={this.buying === car.id}
                    disabled={this.balance < car.price}
                    onclick={() => this.buyCar(car.id)}
                  >
                    {this.balance >= car.price ? 'Buy' : 'Not enough coins'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
