import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import LinkButton from 'flarum/common/components/LinkButton';

import RacingPage from './components/RacingPage';
import GaragePage from './components/GaragePage';
import ShopPage from './components/ShopPage';
import LeaderboardPage from './components/LeaderboardPage';

app.initializers.add('yourvendor-racing', () => {
  // Register routes
  app.routes['racing.index'] = { path: '/racing', component: RacingPage };
  app.routes['racing.garage.page'] = { path: '/racing/garage', component: GaragePage };
  app.routes['racing.shop.page'] = { path: '/racing/shop', component: ShopPage };
  app.routes['racing.leaderboard.page'] = { path: '/racing/leaderboard', component: LeaderboardPage };

  // Add nav link in header
  extend(HeaderSecondary.prototype, 'items', function (items) {
    items.add(
      'racing',
      <LinkButton href={app.route('racing.index')} icon="fas fa-flag-checkered">
        🏎 Racing
      </LinkButton>,
      30
    );
  });
});
