# Basketball Manager - Modular Architecture Documentation

## Overview

This document describes the modular architecture of the Basketball Manager game, which has been refactored to enhance maintainability, readability, and scalability.

## Architecture Principles

The refactored codebase follows these key principles:

1. **Single Responsibility Principle**: Each module has a single, well-defined responsibility
2. **Separation of Concerns**: Different aspects of the game are separated into distinct modules
3. **Dependency Injection**: Modules are injected with their dependencies rather than creating them
4. **Event-Driven Communication**: Modules communicate through events rather than direct calls
5. **Consistent Naming Conventions**: All modules follow consistent naming patterns

## Module Structure

### Core Modules

#### 1. Data Models (`js/modules/dataModels.js`)
**Purpose**: Defines the core data structures for the game
**Responsibilities**:
- Player class and related methods
- Coach class and related methods
- Team class and related methods

**Key Classes**:
- `Player`: Represents a basketball player with attributes, skills, and stats
- `Coach`: Represents a coach with attributes and career stats
- `Team`: Represents a basketball team with roster and stats

#### 2. Game State Manager (`js/modules/gameStateManager.js`)
**Purpose**: Manages the central state of the game and handles data persistence
**Responsibilities**:
- Maintaining game state
- Saving and loading game data
- Providing state subscription mechanism
- Managing unique ID generation

**Key Methods**:
- `getState()`: Get current game state
- `set(key, value)`: Set a specific value in game state
- `subscribe(callback)`: Subscribe to state changes
- `saveGameState()`: Save current game state
- `loadGameState()`: Load saved game state

#### 3. UI Manager (`js/modules/uiManager.js`)
**Purpose**: Handles UI navigation, screen updates, and user interactions
**Responsibilities**:
- Managing navigation between screens
- Updating UI based on game state changes
- Handling modal dialogs
- Showing notifications

**Key Methods**:
- `showScreen(screenId)`: Show a specific screen
- `showModal(modalId, data)`: Show a modal dialog
- `showNotification(message, type)`: Show a notification message

### Feature Modules

#### 4. Game Engine (`js/modules/gameEngine.js`)
**Purpose**: Handles game simulation mechanics and logic
**Responsibilities**:
- Simulating basketball games
- Calculating game statistics
- Managing game flow and events
- Updating game UI during simulation

**Key Methods**:
- `startGame(gameData)`: Start a new game simulation
- `simulatePossession(gameState)`: Simulate a single possession
- `endGame(gameState)`: End a game and update stats

#### 5. Team Manager (`js/modules/teamManager.js`)
**Purpose**: Handles team roster management and team-related operations
**Responsibilities**:
- Managing team roster
- Displaying team information
- Handling player transactions
- Updating team statistics

**Key Methods**:
- `updateTeamManagementScreen()`: Update the team management UI
- `showPlayerDetails(playerId)`: Show detailed player information
- `releasePlayer(playerId)`: Release a player from the team

#### 6. Player Development (`js/modules/playerDevelopment.js`)
**Purpose**: Handles player training and skill development
**Responsibilities**:
- Managing player training
- Skill progression
- Player improvement mechanics

**Key Methods**:
- `startTraining(playerId, trainingType)`: Start training a player
- `updatePlayerDevelopmentScreen()`: Update the player development UI

#### 7. Market Manager (`js/modules/marketManager.js`)
**Purpose**: Handles player recruitment and market operations
**Responsibilities**:
- Managing player market
- Player recruitment
- Contract negotiations

**Key Methods**:
- `updateMarketScreen()`: Update the market UI
- `signPlayer(playerId)`: Sign a player to the team

#### 8. Scouting System (`js/modules/scoutingSystem.js`)
**Purpose**: Handles player scouting and team analysis
**Responsibilities**:
- Managing scouting reports
- Team analysis
- Scouting budget management

**Key Methods**:
- `scoutTeam(teamId)`: Scout a specific team
- `scoutFreeAgents()`: Scout available free agents

#### 9. Coach Manager (`js/modules/coachManager.js`)
**Purpose**: Handles coach hiring and management
**Responsibilities**:
- Managing coach market
- Coach hiring and firing
- Coach contract management

**Key Methods**:
- `updateCoachMarketScreen()`: Update the coach market UI
- `hireCoach(coachId)`: Hire a coach

#### 10. Season Manager (`js/modules/seasonManager.js`)
**Purpose**: Handles season progression and scheduling
**Responsibilities**:
- Managing season schedule
- Season progression
- Playoff management

**Key Methods**:
- `startSeason()`: Start a new season
- `generateSeasonSchedule(teams)`: Generate a season schedule
- `updateStandingsScreen()`: Update the standings UI

#### 11. Finance Manager (`js/modules/financeManager.js`)
**Purpose**: Handles team finances and budgeting
**Responsibilities**:
- Managing team finances
- Revenue and expense tracking
- Budget management

**Key Methods**:
- `updateFinanceScreen()`: Update the finance UI
- `generateMonthlyRevenue()`: Generate monthly revenue
- `calculateMonthlyExpenses()`: Calculate monthly expenses

#### 12. Event System (`js/modules/eventSystem.js`)
**Purpose**: Handles game events and notifications
**Responsibilities**:
- Event publishing and subscription
- Event history tracking
- Notification management

**Key Methods**:
- `publish(eventType, data)`: Publish an event
- `subscribe(eventType, callback)`: Subscribe to an event type
- `showNotification(message, type)`: Show a notification

### Data Modules

#### 13. Game Data (`js/data/gameData.js`)
**Purpose**: Contains all the game's static data and configurations
**Responsibilities**:
- Defining game constants
- Player positions and attributes
- Skills and talents
- Coach archetypes

#### 14. Game Initializer (`js/modules/gameInitializer.js`)
**Purpose**: Handles game setup and utility functions
**Responsibilities**:
- Initializing a new game
- Creating teams and players
- Generating initial game data

## Module Dependencies

The modules have the following dependencies:

```
Main App
├── GameState Manager (Core)
├── UI Manager (Core)
├── Game Engine (Feature)
├── Team Manager (Feature)
├── Player Development (Feature)
├── Market Manager (Feature)
├── Scouting System (Feature)
├── Coach Manager (Feature)
├── Season Manager (Feature)
├── Finance Manager (Feature)
├── Event System (Core)
├── Game Initializer (Utility)
└── Game Data (Data)
```

## Communication Between Modules

Modules communicate through:

1. **State Management**: The GameStateManager acts as a central store
2. **Event System**: Modules publish events that other modules can subscribe to
3. **Dependency Injection**: Modules are injected with their dependencies

## Benefits of This Architecture

1. **Maintainability**: Each module has a single responsibility, making it easier to understand and maintain
2. **Scalability**: New features can be added as new modules without affecting existing code
3. **Testability**: Each module can be tested in isolation
4. **Reusability**: Modules can be reused in different contexts
5. **Readability**: The code is organized in a logical, easy-to-follow structure

## Naming Conventions

The following naming conventions are used throughout the codebase:

1. **Files**: kebab-case (e.g., `gameStateManager.js`)
2. **Classes**: PascalCase (e.g., `GameStateManager`)
3. **Methods**: camelCase (e.g., `updateTeamManagementScreen`)
4. **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_SCHOLARSHIPS`)
5. **Variables**: camelCase (e.g., `userTeam`)

## Future Enhancements

The modular architecture makes it easy to add new features:

1. **New Game Modes**: Can be added as new modules
2. **Multiplayer Support**: Can be added as a new module that extends the existing modules
3. **Advanced Analytics**: Can be added as a new module that subscribes to game events
4. **Customization Options**: Can be added as a new module that modifies game data

## Conclusion

The modular architecture of the Basketball Manager game provides a solid foundation for future development. It separates concerns, reduces coupling, and increases cohesion, making the codebase more maintainable and scalable.