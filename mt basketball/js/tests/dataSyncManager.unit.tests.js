/**
 * Data Sync Manager Unit Tests
 * Tests for real-time bidirectional synchronization between team management
 * and player recruitment modules
 */

class DataSyncManagerTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    logTest(name, passed, error = null) {
        this.testResults.tests.push({ name, passed, error });
        if (passed) {
            this.testResults.passed++;
            console.log(`✅ PASS: ${name}`);
        } else {
            this.testResults.failed++;
            console.error(`❌ FAIL: ${name}`, error);
        }
    }

    assertEqual(actual, expected, message) {
        if (actual === expected) {
            return true;
        }
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }

    assertTrue(value, message) {
        if (value === true) {
            return true;
        }
        throw new Error(`${message}: expected true, got ${value}`);
    }

    assertFalse(value, message) {
        if (value === false) {
            return true;
        }
        throw new Error(`${message}: expected false, got ${value}`);
    }

    assertNotNull(value, message) {
        if (value !== null && value !== undefined) {
            return true;
        }
        throw new Error(`${message}: expected non-null value`);
    }

    assertNull(value, message) {
        if (value === null || value === undefined) {
            return true;
        }
        throw new Error(`${message}: expected null, got ${value}`);
    }

    assertArrayLength(arr, length, message) {
        if (arr && arr.length === length) {
            return true;
        }
        throw new Error(`${message}: expected array length ${length}, got ${arr?.length}`);
    }

    runAllTests() {
        console.log('=== Running Data Sync Manager Unit Tests ===\n');
        
        this.testConstructor();
        this.testSyncEventTypes();
        this.testSubscribeToSyncEvent();
        this.testPublishSyncEvent();
        this.testHandleStateChange();
        this.testDetectRosterChange();
        this.testSanitizeTeamData();
        this.testGenerateEventId();
        this.testScholarshipConsistency();
        this.testRosterConsistency();
        this.testSyncHistory();
        this.testForceFullSync();
        this.testGetSyncStatus();
        this.testCleanup();
        
        this.printResults();
        return this.testResults;
    }

    testConstructor() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            this.assertNotNull(syncManager, 'DataSyncManager should be created');
            this.assertNotNull(syncManager.gameStateManager, 'gameStateManager should be set');
            this.assertFalse(syncManager.isInitialized, 'isInitialized should be false initially');
            this.assertNotNull(syncManager.subscribers, 'subscribers Map should exist');
            this.assertNotNull(syncManager.syncHistory, 'syncHistory array should exist');
            this.assertNotNull(syncManager.SYNC_EVENTS, 'SYNC_EVENTS object should exist');
            
            this.logTest('Constructor test', true);
        } catch (error) {
            this.logTest('Constructor test', false, error.message);
        }
    }

    testSyncEventTypes() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            this.assertEqual(syncManager.SYNC_EVENTS.ROSTER_CHANGED, 'rosterChanged', 'ROSTER_CHANGED should be rosterChanged');
            this.assertEqual(syncManager.SYNC_EVENTS.SCHOLARSHIP_CHANGED, 'scholarshipChanged', 'SCHOLARSHIP_CHANGED should be scholarshipChanged');
            this.assertEqual(syncManager.SYNC_EVENTS.PLAYER_SIGNED, 'playerSigned', 'PLAYER_SIGNED should be playerSigned');
            this.assertEqual(syncManager.SYNC_EVENTS.PLAYER_RELEASED, 'playerReleased', 'PLAYER_RELEASED should be playerReleased');
            this.assertEqual(syncManager.SYNC_EVENTS.AVAILABLE_PLAYERS_CHANGED, 'availablePlayersChanged', 'AVAILABLE_PLAYERS_CHANGED should be availablePlayersChanged');
            this.assertEqual(syncManager.SYNC_EVENTS.TEAM_DATA_CHANGED, 'teamDataChanged', 'TEAM_DATA_CHANGED should be teamDataChanged');
            this.assertEqual(syncManager.SYNC_EVENTS.FULL_SYNC, 'fullSync', 'FULL_SYNC should be fullSync');
            
            this.logTest('Sync event types test', true);
        } catch (error) {
            this.logTest('Sync event types test', false, error.message);
        }
    }

    testSubscribeToSyncEvent() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            let callbackCalled = false;
            const callback = () => { callbackCalled = true; };
            
            const unsubscribe = syncManager.subscribeToSyncEvent('testEvent', callback, 100);
            
            this.assertTrue(syncManager.subscribers.has('testEvent'), 'testEvent should be in subscribers');
            this.assertArrayLength(syncManager.subscribers.get('testEvent'), 1, 'testEvent should have 1 subscriber');
            
            unsubscribe();
            this.assertArrayLength(syncManager.subscribers.get('testEvent'), 0, 'testEvent should have 0 subscribers after unsubscribe');
            
            this.logTest('Subscribe to sync event test', true);
        } catch (error) {
            this.logTest('Subscribe to sync event test', false, error.message);
        }
    }

    testPublishSyncEvent() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            let receivedData = null;
            const callback = (data) => { receivedData = data; };
            
            syncManager.subscribeToSyncEvent('testEvent', callback);
            syncManager.publishSyncEvent('testEvent', { test: 'data' });
            
            this.assertNotNull(receivedData, 'Callback should receive data');
            this.assertEqual(receivedData.test, 'data', 'Received data should match');
            
            this.logTest('Publish sync event test', true);
        } catch (error) {
            this.logTest('Publish sync event test', false, error.message);
        }
    }

    testHandleStateChange() {
        try {
            const mockGameStateManager = {
                subscribe: (callback) => {
                    this.testCallback = callback;
                    return () => {};
                },
                getState: () => ({ 
                    userTeam: { id: 1, name: 'Test Team', roster: [] },
                    availablePlayers: [],
                    funds: 1000,
                    scholarships: 13
                }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            let eventReceived = false;
            syncManager.subscribeToSyncEvent('teamDataChanged', () => { eventReceived = true; });
            
            if (this.testCallback) {
                this.testCallback('userTeam', { id: 1, name: 'Test Team', roster: [] }, mockGameStateManager.getState());
            }
            
            this.assertTrue(eventReceived, 'teamDataChanged event should be received');
            
            this.logTest('Handle state change test', true);
        } catch (error) {
            this.logTest('Handle state change test', false, error.message);
        }
    }

    testDetectRosterChange() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            const teamWithPlayer = {
                roster: [{ id: 1, name: 'Player 1' }]
            };
            
            const emptyTeam = {
                roster: []
            };
            
            syncManager.lastKnownState.userTeam = emptyTeam;
            
            const result = syncManager.detectRosterChange(teamWithPlayer);
            
            this.assertTrue(result.hasChanged, 'Should detect roster change');
            this.assertEqual(result.changeType, 'playerAdded', 'Should detect player added');
            this.assertEqual(result.playerId, 1, 'Should have correct player ID');
            
            this.logTest('Detect roster change test', true);
        } catch (error) {
            this.logTest('Detect roster change test', false, error.message);
        }
    }

    testSanitizeTeamData() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            const teamData = {
                id: 1,
                name: 'Test Team',
                roster: [
                    { 
                        id: 1, 
                        name: 'Player 1', 
                        position: 'PG',
                        year: 1,
                        potential: 80,
                        getOverallRating: () => 75
                    }
                ],
                scholarships: 13,
                scholarshipsUsed: 5,
                stats: { wins: 10, losses: 5 }
            };
            
            const sanitized = syncManager.sanitizeTeamData(teamData);
            
            this.assertEqual(sanitized.id, 1, 'ID should be preserved');
            this.assertEqual(sanitized.name, 'Test Team', 'Name should be preserved');
            this.assertEqual(sanitized.scholarships, 13, 'Scholarships should be preserved');
            this.assertEqual(sanitized.scholarshipsUsed, 5, 'Scholarships used should be preserved');
            this.assertArrayLength(sanitized.roster, 1, 'Roster should have 1 player');
            this.assertEqual(sanitized.roster[0].id, 1, 'Player ID should be preserved');
            this.assertEqual(sanitized.roster[0].position, 'PG', 'Player position should be preserved');
            
            this.logTest('Sanitize team data test', true);
        } catch (error) {
            this.logTest('Sanitize team data test', false, error.message);
        }
    }

    testGenerateEventId() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            const eventId1 = syncManager.generateEventId();
            const eventId2 = syncManager.generateEventId();
            
            this.assertNotNull(eventId1, 'Event ID should be generated');
            this.assertNotNull(eventId2, 'Event ID should be generated');
            this.assertTrue(eventId1.startsWith('sync_'), 'Event ID should start with sync_');
            this.assertTrue(eventId1 !== eventId2, 'Event IDs should be unique');
            
            this.logTest('Generate event ID test', true);
        } catch (error) {
            this.logTest('Generate event ID test', false, error.message);
        }
    }

    testScholarshipConsistency() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: (key, value) => {
                    if (key === 'userTeam') {
                        this.mockUserTeam = value;
                    }
                }
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            const userTeam = {
                roster: [{ id: 1 }, { id: 2 }, { id: 3 }],
                scholarshipsUsed: 2,
                scholarships: 13
            };
            
            this.mockUserTeam = userTeam;
            
            syncManager.verifyScholarshipConsistency(userTeam);
            
            this.assertEqual(userTeam.scholarshipsUsed, 3, 'Scholarships used should be updated to match roster length');
            
            this.logTest('Scholarship consistency test', true);
        } catch (error) {
            this.logTest('Scholarship consistency test', false, error.message);
        }
    }

    testRosterConsistency() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            const userTeam = {
                roster: [
                    { id: 1, name: 'Player 1' },
                    { id: 2, name: 'Player 2' },
                    { id: 1, name: 'Player 1' },
                    { id: 3, name: 'Player 3' }
                ]
            };
            
            syncManager.verifyRosterConsistency(userTeam);
            
            this.assertArrayLength(userTeam.roster, 3, 'Duplicate players should be removed');
            
            const ids = userTeam.roster.map(p => p.id);
            this.assertTrue(!ids.includes(1) || ids.indexOf(1) === ids.lastIndexOf(1), 'Player 1 should appear only once');
            
            this.logTest('Roster consistency test', true);
        } catch (error) {
            this.logTest('Roster consistency test', false, error.message);
        }
    }

    testSyncHistory() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            this.assertArrayLength(syncManager.syncHistory, 0, 'Sync history should be empty initially');
            
            syncManager.recordSync({ type: 'test', timestamp: Date.now() });
            syncManager.recordSync({ type: 'test2', timestamp: Date.now() });
            
            this.assertArrayLength(syncManager.syncHistory, 2, 'Sync history should have 2 entries');
            
            const history = syncManager.getSyncHistory();
            this.assertArrayLength(history, 2, 'getSyncHistory should return all entries');
            
            const filteredHistory = syncManager.getSyncHistory({ type: 'test' });
            this.assertArrayLength(filteredHistory, 1, 'getSyncHistory with filter should return filtered entries');
            
            this.logTest('Sync history test', true);
        } catch (error) {
            this.logTest('Sync history test', false, error.message);
        }
    }

    testForceFullSync() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ 
                    userTeam: { id: 1, name: 'Test Team', roster: [] },
                    availablePlayers: []
                }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            let fullSyncEventReceived = false;
            syncManager.subscribeToSyncEvent('fullSync', () => { fullSyncEventReceived = true; });
            
            syncManager.forceFullSync();
            
            this.assertTrue(fullSyncEventReceived, 'Full sync event should be received');
            this.assertNotNull(syncManager.lastKnownState.userTeam, 'Last known state should be updated');
            
            this.logTest('Force full sync test', true);
        } catch (error) {
            this.logTest('Force full sync test', false, error.message);
        }
    }

    testGetSyncStatus() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            const status = syncManager.getSyncStatus();
            
            this.assertNotNull(status, 'Status should be returned');
            this.assertFalse(status.isInitialized, 'isInitialized should be false');
            this.assertEqual(status.syncHistoryCount, 0, 'syncHistoryCount should be 0');
            this.assertEqual(status.subscriberCount, 0, 'subscriberCount should be 0');
            this.assertNotNull(status.activeIntervals, 'activeIntervals should exist');
            
            this.logTest('Get sync status test', true);
        } catch (error) {
            this.logTest('Get sync status test', false, error.message);
        }
    }

    testCleanup() {
        try {
            const mockGameStateManager = {
                subscribe: () => () => {},
                getState: () => ({ userTeam: null, availablePlayers: [] }),
                set: () => {}
            };
            
            const syncManager = new DataSyncManager(mockGameStateManager);
            
            syncManager.syncInterval = setInterval(() => {}, 1000);
            syncManager.consistencyCheckInterval = setInterval(() => {}, 1000);
            
            syncManager.subscribeToSyncEvent('testEvent', () => {});
            
            syncManager.cleanup();
            
            this.assertNull(syncManager.syncInterval, 'syncInterval should be null after cleanup');
            this.assertNull(syncManager.consistencyCheckInterval, 'consistencyCheckInterval should be null after cleanup');
            this.assertEqual(syncManager.subscribers.size, 0, 'subscribers should be empty after cleanup');
            this.assertArrayLength(syncManager.syncHistory, 0, 'syncHistory should be empty after cleanup');
            
            this.logTest('Cleanup test', true);
        } catch (error) {
            this.logTest('Cleanup test', false, error.message);
        }
    }

    printResults() {
        console.log('\n=== Test Results ===');
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Total: ${this.testResults.tests.length}`);
        
        if (this.testResults.failed > 0) {
            console.log('\nFailed tests:');
            this.testResults.tests
                .filter(t => !t.passed)
                .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
        }
    }
}

window.DataSyncManagerTests = DataSyncManagerTests;
