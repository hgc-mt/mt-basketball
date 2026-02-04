/**
 * Data Sync Manager Integration Tests
 * Tests for real-time bidirectional synchronization between team management
 * and player recruitment modules
 */

class DataSyncManagerIntegrationTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
        this.mockModules = {};
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

    setupMocks() {
        this.mockModules.gameStateManager = {
            state: {
                userTeam: {
                    id: 1,
                    name: 'Test University',
                    roster: [],
                    scholarships: 13,
                    scholarshipsUsed: 0
                },
                availablePlayers: [
                    {
                        id: 101,
                        name: 'John Doe',
                        position: 'PG',
                        year: 1,
                        potential: 85,
                        rating: 72,
                        status: 'free_agent'
                    },
                    {
                        id: 102,
                        name: 'Jane Smith',
                        position: 'SG',
                        year: 2,
                        potential: 80,
                        rating: 68,
                        status: 'transfer_wanted'
                    }
                ],
                funds: 500000,
                scholarships: 13
            },
            subscribers: [],
            subscribe(callback) {
                this.subscribers.push(callback);
                return () => {
                    const index = this.subscribers.indexOf(callback);
                    if (index > -1) this.subscribers.splice(index, 1);
                };
            },
            notifySubscribers(key, value) {
                this.subscribers.forEach(cb => cb(key, value, this.state));
            },
            getState() {
                return { ...this.state };
            },
            set(key, value) {
                this.state[key] = value;
                this.notifySubscribers(key, value);
            }
        };

        this.mockModules.contractManager = {
            dataSyncManager: null,
            signPlayerResult: null,
            setDataSyncManager(dsm) {
                this.dataSyncManager = dsm;
            },
            signPlayer(playerId, scholarshipPercent) {
                this.signPlayerResult = { playerId, scholarshipPercent, success: true };
                if (this.dataSyncManager) {
                    this.dataSyncManager.publishSyncEvent('playerSigned', {
                        playerId,
                        playerName: 'Test Player',
                        scholarshipPercent,
                        timestamp: Date.now()
                    });
                }
                return { success: true, message: 'Player signed' };
            },
            releasePlayer(playerId) {
                if (this.dataSyncManager) {
                    this.dataSyncManager.publishSyncEvent('playerReleased', {
                        playerId,
                        playerName: 'Released Player',
                        timestamp: Date.now()
                    });
                }
                return { success: true, message: 'Player released' };
            }
        };

        this.mockModules.teamManager = {
            updateCalled: false,
            updateTeamManagementScreen() {
                this.updateCalled = true;
            }
        };

        this.mockModules.recruitmentInterface = {
            loadCalled: false,
            renderCalled: false,
            loadPlayers() {
                this.loadCalled = true;
            },
            renderAll() {
                this.renderCalled = true;
            }
        };
    }

    runAllTests() {
        console.log('=== Running Data Sync Manager Integration Tests ===\n');
        
        this.setupMocks();
        
        this.testPlayerSigningTriggersSync();
        this.testPlayerReleaseTriggersSync();
        this.testTeamManagerUpdatesOnRosterChange();
        this.testRecruitmentInterfaceUpdatesOnPlayerChange();
        this.testScholarshipDataSync();
        this.testBidirectionalSyncFlow();
        this.testEventPrioritization();
        this.testConsistencyVerification();
        this.testPeriodicSyncCheck();
        this.testStateSubscriptionIntegration();
        
        this.printResults();
        return this.testResults;
    }

    testPlayerSigningTriggersSync() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            
            let syncEventReceived = false;
            dsm.subscribeToSyncEvent('playerSigned', (data) => {
                syncEventReceived = true;
                this.assertEqual(data.playerId, 101, 'Player ID should match');
            });
            
            this.mockModules.contractManager.setDataSyncManager(dsm);
            
            const result = this.mockModules.contractManager.signPlayer(101, 100);
            
            this.assertTrue(result.success, 'Sign player should succeed');
            this.assertTrue(syncEventReceived, 'Sync event should be received');
            
            this.logTest('Player signing triggers sync', true);
        } catch (error) {
            this.logTest('Player signing triggers sync', false, error.message);
        }
    }

    testPlayerReleaseTriggersSync() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            
            let syncEventReceived = false;
            dsm.subscribeToSyncEvent('playerReleased', (data) => {
                syncEventReceived = true;
                this.assertEqual(data.playerId, 201, 'Released player ID should match');
            });
            
            this.mockModules.contractManager.setDataSyncManager(dsm);
            
            const result = this.mockModules.contractManager.releasePlayer(201);
            
            this.assertTrue(result.success, 'Release player should succeed');
            this.assertTrue(syncEventReceived, 'Sync event should be received');
            
            this.logTest('Player release triggers sync', true);
        } catch (error) {
            this.logTest('Player release triggers sync', false, error.message);
        }
    }

    testTeamManagerUpdatesOnRosterChange() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            
            dsm.subscribeToSyncEvent('rosterChanged', () => {
                this.mockModules.teamManager.updateTeamManagementScreen();
            });
            
            this.mockModules.gameStateManager.set('userTeam', {
                id: 1,
                name: 'Test University',
                roster: [{ id: 1, name: 'New Player' }],
                scholarships: 13,
                scholarshipsUsed: 1
            });
            
            this.assertTrue(this.mockModules.teamManager.updateCalled, 'Team manager should update on roster change');
            
            this.logTest('Team manager updates on roster change', true);
        } catch (error) {
            this.logTest('Team manager updates on roster change', false, error.message);
        }
    }

    testRecruitmentInterfaceUpdatesOnPlayerChange() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            
            dsm.subscribeToSyncEvent('availablePlayersChanged', () => {
                const ri = this.mockModules.recruitmentInterface;
                ri.loadPlayers();
                ri.renderAll();
            });
            
            const initialPlayers = this.mockModules.gameStateManager.state.availablePlayers;
            const newPlayers = [
                ...initialPlayers,
                { id: 103, name: 'New Player', position: 'SF', year: 1, potential: 78, rating: 65 }
            ];
            
            this.mockModules.gameStateManager.set('availablePlayers', newPlayers);
            
            this.assertTrue(this.mockModules.recruitmentInterface.loadCalled, 'Recruitment interface should load players');
            this.assertTrue(this.mockModules.recruitmentInterface.renderCalled, 'Recruitment interface should render');
            
            this.logTest('Recruitment interface updates on player change', true);
        } catch (error) {
            this.logTest('Recruitment interface updates on player change', false, error.message);
        }
    }

    testScholarshipDataSync() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            
            let scholarshipUpdateCalled = false;
            dsm.subscribeToSyncEvent('scholarshipChanged', () => {
                scholarshipUpdateCalled = true;
            });
            
            this.mockModules.gameStateManager.set('scholarships', 12);
            
            this.assertTrue(scholarshipUpdateCalled, 'Scholarship change should trigger sync');
            
            this.logTest('Scholarship data sync', true);
        } catch (error) {
            this.logTest('Scholarship data sync', false, error.message);
        }
    }

    testBidirectionalSyncFlow() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            const events = [];
            
            dsm.subscribeToSyncEvent('playerSigned', (data) => events.push('playerSigned'));
            dsm.subscribeToSyncEvent('rosterChanged', (data) => events.push('rosterChanged'));
            dsm.subscribeToSyncEvent('teamDataChanged', (data) => events.push('teamDataChanged'));
            
            this.mockModules.contractManager.setDataSyncManager(dsm);
            
            this.mockModules.contractManager.signPlayer(101, 100);
            
            this.assertTrue(events.includes('playerSigned'), 'playerSigned event should be in events');
            this.assertTrue(events.includes('rosterChanged'), 'rosterChanged event should be in events');
            this.assertTrue(events.includes('teamDataChanged'), 'teamDataChanged event should be in events');
            
            this.logTest('Bidirectional sync flow', true);
        } catch (error) {
            this.logTest('Bidirectional sync flow', false, error.message);
        }
    }

    testEventPrioritization() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            const callOrder = [];
            
            dsm.subscribeToSyncEvent('testEvent', () => callOrder.push('low'), 10);
            dsm.subscribeToSyncEvent('testEvent', () => callOrder.push('high'), 100);
            dsm.subscribeToSyncEvent('testEvent', () => callOrder.push('medium'), 50);
            
            dsm.publishSyncEvent('testEvent', {});
            
            this.assertEqual(callOrder[0], 'high', 'High priority callback should be called first');
            this.assertEqual(callOrder[1], 'medium', 'Medium priority callback should be called second');
            this.assertEqual(callOrder[2], 'low', 'Low priority callback should be called last');
            
            this.logTest('Event prioritization', true);
        } catch (error) {
            this.logTest('Event prioritization', false, error.message);
        }
    }

    testConsistencyVerification() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            
            this.mockModules.gameStateManager.state.userTeam = {
                id: 1,
                name: 'Test Team',
                roster: [{ id: 1 }, { id: 2 }, { id: 3 }],
                scholarships: 13,
                scholarshipsUsed: 2
            };
            
            dsm.performConsistencyCheck();
            
            this.assertEqual(
                this.mockModules.gameStateManager.state.userTeam.scholarshipsUsed,
                3,
                'Scholarships used should be fixed to match roster length'
            );
            
            this.logTest('Consistency verification', true);
        } catch (error) {
            this.logTest('Consistency verification', false, error.message);
        }
    }

    testPeriodicSyncCheck() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            
            dsm.startPeriodicSyncCheck();
            
            this.assertNotNull(dsm.syncInterval, 'Sync interval should be set');
            
            dsm.stopPeriodicSyncCheck();
            
            this.assertNull(dsm.syncInterval, 'Sync interval should be cleared');
            
            this.logTest('Periodic sync check', true);
        } catch (error) {
            this.logTest('Periodic sync check', false, error.message);
        }
    }

    testStateSubscriptionIntegration() {
        try {
            const dsm = new DataSyncManager(this.mockModules.gameStateManager);
            let stateChangeCount = 0;
            
            dsm.subscribeToSyncEvent('teamDataChanged', () => stateChangeCount++);
            
            this.mockModules.gameStateManager.set('userTeam', { id: 1, roster: [] });
            this.mockModules.gameStateManager.set('userTeam', { id: 1, roster: [{ id: 1 }] });
            
            this.assertEqual(stateChangeCount, 2, 'State change should trigger sync events');
            
            this.logTest('State subscription integration', true);
        } catch (error) {
            this.logTest('State subscription integration', false, error.message);
        }
    }

    printResults() {
        console.log('\n=== Integration Test Results ===');
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

window.DataSyncManagerIntegrationTests = DataSyncManagerIntegrationTests;
