<?php

use Flarum\Extend;
use YourVendor\Racing\Api\Controllers;
use YourVendor\Racing\Listeners;

return [
    // Migrations
    (new Extend\Migration()),

    // Routes
    (new Extend\Routes('api'))
        // Garage
        ->get('/racing/garage', 'racing.garage', Controllers\GarageController::class)
        ->post('/racing/garage/buy', 'racing.garage.buy', Controllers\BuyCarController::class)
        // Shop
        ->get('/racing/shop', 'racing.shop', Controllers\ShopController::class)
        // Lobby
        ->get('/racing/lobby', 'racing.lobby', Controllers\LobbyController::class)
        ->post('/racing/lobby/challenge', 'racing.challenge', Controllers\ChallengeController::class)
        ->post('/racing/lobby/accept/{id}', 'racing.accept', Controllers\AcceptChallengeController::class)
        ->post('/racing/lobby/decline/{id}', 'racing.decline', Controllers\DeclineChallengeController::class)
        // Race
        ->get('/racing/race/{id}', 'racing.race', Controllers\RaceController::class)
        // Leaderboard
        ->get('/racing/leaderboard', 'racing.leaderboard', Controllers\LeaderboardController::class)
        // Profile wallet
        ->get('/racing/wallet', 'racing.wallet', Controllers\WalletController::class),

    // Frontend
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less')
        ->route('/racing', 'racing.index')
        ->route('/racing/garage', 'racing.garage.page')
        ->route('/racing/shop', 'racing.shop.page')
        ->route('/racing/leaderboard', 'racing.leaderboard.page'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),

    // Locale
    (new Extend\Locales(__DIR__ . '/locale')),

    // Give coins on post
    (new Extend\Event())
        ->listen(\Flarum\Post\Event\Posted::class, Listeners\GiveCoinsOnPost::class)
        ->listen(\Flarum\Post\Event\Liked::class, Listeners\GiveCoinsOnLike::class),

    // User settings (wallet balance)
    (new Extend\ApiSerializer(\Flarum\Api\Serializer\CurrentUserSerializer::class))
        ->attributes(Listeners\AddUserAttributes::class),
];
