import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Link from 'flarum/common/components/Link';

export default class RacingPage extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = true;
    this.challenges = [];
    this.myChallenges = [];
    this.myPosted = [];
    this.balance = 0;
    this.selectedCar = null;
    this.myCars = [];
    this.bet = 0;
    this.postingChallenge = false;
    this.raceResult = null;
    this.acceptingId = null;

    this.loadLobby();
    this.loadGarage();
  }

  async loadLobby() {
    this.loading = true;
    m.redraw();
    try {
      const res = await app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/racing/lobby` });
      this.challenges = res.open_challenges || [];
      this.myChallenges = res.my_challenges || [];
      this.myPosted = res.my_posted || [];
      this.balance = res.balance || 0;
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
    m.redraw();
  }

  async loadGarage() {
    try {
      const res = await app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/racing/garage` });
      this.myCars = res.cars || [];
      if (this.myCars.length > 0 && !this.selectedCar) {
        this.selectedCar = this.myCars[0].id;
      }
    } catch (e) {}
    m.redraw();
  }

  async postChallenge() {
    if (!this.selectedCar) return;
    this.postingChallenge = true;
    m.redraw();
    try {
      const res = await app.request({
        method: 'POST',
        url: `${app.forum.attribute('apiUrl')}/racing/lobby/challenge`,
        body: { car_id: this.selectedCar, bet: parseInt(this.bet) || 0 },
      });
      app.alerts.show({ type: 'success' }, res.message || 'Challenge posted!');
      await this.loadLobby();
    } catch (e) {
      const err = e?.response?.errors?.[0]?.detail || 'Error posting challenge';
      app.alerts.show({ type: 'error' }, err);
    }
    this.postingChallenge = false;
    m.redraw();
  }

  async acceptChallenge(challengeId) {
    if (!this.selectedCar) {
      app.alerts.show({ type: 'error' }, 'Select a car first!');
      return;
    }
    this.acceptingId = challengeId;
    m.redraw();
    try {
      const res = await app.request({
        method: 'POST',
        url: `${app.forum.attribute('apiUrl')}/racing/lobby/accept/${challengeId}`,
        body: { car_id: this.selectedCar },
      });
      this.raceResult = res;
      this.balance = res.my_new_balance;
      await this.loadLobby();
    } catch (e) {
      const err = e?.response?.errors?.[0]?.detail || 'Error accepting challenge';
      app.alerts.show({ type: 'error' }, err);
    }
    this.acceptingId = null;
    m.redraw();
  }

  async declineChallenge(challengeId) {
    try {
      await app.request({
        method: 'POST',
        url: `${app.forum.attribute('apiUrl')}/racing/lobby/decline/${challengeId}`,
        body: {},
      });
      await this.loadLobby();
    } catch (e) {}
  }

  view() {
    return (
      <div className="RacingPage">
        <div className="RacingPage-header">
          <h1>🏎 Racing Lobby</h1>
          <div className="RacingPage-nav">
            <Link href={app.route('racing.garage.page')} className="Button Button--primary">🚗 My Garage</Link>
            <Link href={app.route('racing.shop.page')} className="Button">🏪 Shop</Link>
            <Link href={app.route('racing.leaderboard.page')} className="Button">🏆 Leaderboard</Link>
            <span className="RacingPage-balance">💰 {this.balance} coins</span>
          </div>
        </div>

        {this.raceResult && this.renderRaceResult()}

        {this.loading ? (
          <LoadingIndicator />
        ) : (
          <div className="RacingPage-content">
            {this.renderPostChallenge()}
            {this.myChallenges.length > 0 && this.renderIncomingChallenges()}
            {this.renderOpenChallenges()}
          </div>
        )}
      </div>
    );
  }

  renderRaceResult() {
    const r = this.raceResult;
    const won = r.i_won;

    return (
      <div className={`RaceResult ${won ? 'RaceResult--win' : 'RaceResult--lose'}`}>
        <button className="RaceResult-close" onclick={() => { this.raceResult = null; m.redraw(); }}>✕</button>
        <h2>{won ? '🏆 You Won!' : '💀 You Lost!'}</h2>
        <div className="RaceResult-score">
          {r.challenger_score} — {r.challenged_score}
        </div>
        {r.prize > 0 && (
          <div className="RaceResult-prize">
            {won ? `+${r.prize} coins` : `-${r.prize} coins`}
          </div>
        )}
        <div className="RaceResult-log">
          {(r.log || []).filter(e => e.segment !== 'finish').map(e => (
            <div className={`RaceResult-event ${e.leader === 'challenger' || e.leader === 'challenged' ? '' : ''}`}>
              <span className="RaceResult-seg">Segment {e.segment}</span>
              <span>{e.event}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderPostChallenge() {
    const hasCars = this.myCars.length > 0;
    const hasPosted = this.myPosted.length > 0;

    return (
      <div className="RacingPanel">
        <h3>Post a Challenge</h3>
        {!hasCars ? (
          <p>You don't own any cars yet. <Link href={app.route('racing.shop.page')}>Buy one!</Link></p>
        ) : hasPosted ? (
          <div>
            <p>You already have an open challenge in the lobby.</p>
            <Button className="Button Button--danger" onclick={() => this.declineChallenge(this.myPosted[0].id)}>
              Cancel Challenge
            </Button>
          </div>
        ) : (
          <div className="RacingPanel-form">
            <label>Select your car:</label>
            <select onchange={(e) => { this.selectedCar = parseInt(e.target.value); }}>
              {this.myCars.map(car => (
                <option value={car.id} selected={this.selectedCar === car.id}>
                  {car.emoji} {car.name} (Speed {car.speed} | Acc {car.acceleration})
                </option>
              ))}
            </select>
            <label>Bet (coins):</label>
            <input
              type="number"
              min="0"
              max={this.balance}
              value={this.bet}
              oninput={(e) => { this.bet = e.target.value; }}
              placeholder="0 = no bet"
            />
            <Button
              className="Button Button--primary"
              loading={this.postingChallenge}
              onclick={() => this.postChallenge()}
            >
              🏁 Post to Lobby
            </Button>
          </div>
        )}
      </div>
    );
  }

  renderIncomingChallenges() {
    return (
      <div className="RacingPanel RacingPanel--incoming">
        <h3>⚠️ Challenges for You</h3>
        {this.myChallenges.map(c => (
          <div className="ChallengeCard ChallengeCard--incoming">
            <div className="ChallengeCard-car" style={`border-color: ${c.color}`}>
              <span className="ChallengeCard-emoji">{c.emoji}</span>
              <div>
                <strong>{c.car_name}</strong>
                <span className={`Rarity Rarity--${c.rarity}`}>{c.rarity}</span>
              </div>
            </div>
            <div className="ChallengeCard-info">
              <strong>{c.challenger_name}</strong> challenges you!
              {c.bet > 0 && <span className="ChallengeCard-bet"> 💰 Bet: {c.bet} coins</span>}
              <div className="ChallengeCard-stats">
                Speed {c.speed} | Acc {c.acceleration} | Handling {c.handling} | Luck {c.luck}
              </div>
            </div>
            <div className="ChallengeCard-actions">
              <Button
                className="Button Button--primary"
                loading={this.acceptingId === c.id}
                onclick={() => this.acceptChallenge(c.id)}
              >
                Accept
              </Button>
              <Button className="Button Button--danger" onclick={() => this.declineChallenge(c.id)}>
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  renderOpenChallenges() {
    return (
      <div className="RacingPanel">
        <h3>🌐 Open Challenges</h3>
        {this.challenges.length === 0 ? (
          <p>No open challenges. Be the first to post one!</p>
        ) : (
          this.challenges.map(c => (
            <div className="ChallengeCard">
              <div className="ChallengeCard-car" style={`border-color: ${c.color}`}>
                <span className="ChallengeCard-emoji">{c.emoji}</span>
                <div>
                  <strong>{c.car_name}</strong>
                  <span className={`Rarity Rarity--${c.rarity}`}>{c.rarity}</span>
                </div>
              </div>
              <div className="ChallengeCard-info">
                <strong>{c.challenger_name}</strong>
                {c.bet > 0 && <span className="ChallengeCard-bet"> 💰 Bet: {c.bet} coins</span>}
                <div className="ChallengeCard-stats">
                  Speed {c.speed} | Acc {c.acceleration} | Handling {c.handling} | Luck {c.luck}
                </div>
              </div>
              <div className="ChallengeCard-actions">
                <Button
                  className="Button Button--primary"
                  loading={this.acceptingId === c.id}
                  onclick={() => this.acceptChallenge(c.id)}
                >
                  Race!
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
}
