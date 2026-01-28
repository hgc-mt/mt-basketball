/**
 * Finance Manager module
 * Handles team finances and budgeting
 */

// import { Team } from './dataModels.js';

class FinanceManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Finance Manager initialized');
    }

    updateFinanceScreen() {
        this.updateFinanceOverview();
        this.updateFinanceDetails();
        this.setupFinanceEvents();
    }

    updateFinanceOverview() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const overviewContainer = document.getElementById('finance-summary');
        if (!overviewContainer) return;

        const monthlyRevenue = this.calculateMonthlyRevenueTotal(userTeam);
        const monthlyExpenses = this.calculateMonthlyExpenseTotal(userTeam);
        const netIncome = monthlyRevenue - monthlyExpenses;
        const scholarshipCost = userTeam.roster.length * 25000;

        const overviewHtml = `
            <div class="finance-item">
                <span class="finance-label">当前资金</span>
                <span class="finance-value">$${(userTeam.funds || 0).toLocaleString()}</span>
            </div>
            <div class="finance-item">
                <span class="finance-label">教练年薪</span>
                <span class="finance-value">$${userTeam.coach ? userTeam.coach.salary.toLocaleString() : 0}</span>
            </div>
            <div class="finance-item">
                <span class="finance-label">奖学金支出</span>
                <span class="finance-value">$${scholarshipCost.toLocaleString()}</span>
            </div>
            <div class="finance-item">
                <span class="finance-label">本月收入</span>
                <span class="finance-value positive">+$${monthlyRevenue.toLocaleString()}</span>
            </div>
            <div class="finance-item">
                <span class="finance-label">本月支出</span>
                <span class="finance-value negative">-$${monthlyExpenses.toLocaleString()}</span>
            </div>
            <div class="finance-item">
                <span class="finance-label">月度净收入</span>
                <span class="finance-value ${netIncome >= 0 ? 'positive' : 'negative'}">
                    ${netIncome > 0 ? '+' : ''}$${netIncome.toLocaleString()}
                </span>
            </div>
            <div class="finance-item">
                <span class="finance-label">球队估值</span>
                <span class="finance-value">$${this.calculateTeamValue(userTeam).toLocaleString()}</span>
            </div>
            <div class="finance-item">
                <span class="finance-label">预算状态</span>
                <span class="finance-value ${this.getBudgetStatus(userTeam)}">${this.getBudgetStatusText(userTeam) || '未知'}</span>
            </div>
        `;

        overviewContainer.innerHTML = overviewHtml;
    }

    updateFinanceDetails() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        // Update revenue breakdown
        const revenueContainer = document.getElementById('revenue-breakdown');
        if (revenueContainer) {
            const revenues = this.calculateMonthlyRevenues(userTeam);
            const revenueHtml = Object.entries(revenues).map(([source, amount]) => `
                <div class="finance-item">
                    <span class="finance-label">${this.getRevenueSourceName(source)}</span>
                    <span class="finance-value positive">$${amount.toLocaleString()}</span>
                </div>
            `).join('');

            revenueContainer.innerHTML = revenueHtml;
        }

        // Update expenses breakdown
        const expensesContainer = document.getElementById('expenses-breakdown');
        if (expensesContainer) {
            const expenses = this.calculateMonthlyExpenses(userTeam);
            const expensesHtml = Object.entries(expenses).map(([category, amount]) => `
                <div class="finance-item">
                    <span class="finance-label">${this.getExpenseCategoryName(category)}</span>
                    <span class="finance-value negative">$${amount.toLocaleString()}</span>
                </div>
            `).join('');

            expensesContainer.innerHTML = expensesHtml;
        }
    }

    setupFinanceEvents() {
        // Generate revenue button
        const generateRevenueBtn = document.getElementById('generate-revenue-btn');
        if (generateRevenueBtn) {
            generateRevenueBtn.addEventListener('click', () => {
                this.generateMonthlyRevenue();
            });
        }

        // Calculate expenses button
        const calculateExpensesBtn = document.getElementById('calculate-expenses-btn');
        if (calculateExpensesBtn) {
            calculateExpensesBtn.addEventListener('click', () => {
                this.calculateMonthlyExpenses();
            });
        }
    }

    calculateMonthlyRevenues(team) {
        const revenues = {};

        // Ticket sales (based on team prestige)
        revenues.ticketSales = Math.floor(team.getTeamStrength() * 1000);

        // Merchandise
        revenues.merchandise = Math.floor(team.getTeamStrength() * 500);

        // Sponsorships
        revenues.sponsorships = Math.floor(team.getTeamStrength() * 800);

        // Broadcasting
        revenues.broadcasting = Math.floor(team.getTeamStrength() * 600);

        // Donations
        revenues.donations = Math.floor(team.getTeamStrength() * 300);

        return revenues;
    }

    calculateMonthlyExpenses(team) {
        const expenses = {};

        // Coach salary
        expenses.coachSalary = team.coach ? team.coach.salary / 12 : 0;

        // Player scholarships
        expenses.playerScholarships = team.roster.length * 25000;

        // Travel expenses
        expenses.travel = 50000;

        // Equipment
        expenses.equipment = 20000;

        // Facilities
        expenses.facilities = 30000;

        return expenses;
    }

    calculateMonthlyNetIncome(team) {
        const revenues = this.calculateMonthlyRevenues(team);
        const expenses = this.calculateMonthlyExpenses(team);

        const totalRevenue = Object.values(revenues).reduce((sum, amount) => sum + amount, 0);
        const totalExpenses = Object.values(expenses).reduce((sum, amount) => sum + amount, 0);

        return totalRevenue - totalExpenses;
    }

    generateMonthlyRevenue() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const revenues = this.calculateMonthlyRevenues(userTeam);
        const totalRevenue = Object.values(revenues).reduce((sum, amount) => sum + amount, 0);

        // Add to team funds
        userTeam.funds += totalRevenue;

        // Update UI
        this.updateFinanceOverview();

        this.showNotification(`本月收入: $${totalRevenue.toLocaleString()}`, 'success');

        // Save game state
        this.gameStateManager.saveGameState();
    }

    calculateMonthlyExpenses() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const expenses = this.calculateMonthlyExpenses(userTeam);
        const totalExpenses = Object.values(expenses).reduce((sum, amount) => sum + amount, 0);

        // Subtract from team funds
        if (userTeam.funds >= totalExpenses) {
            userTeam.funds -= totalExpenses;

            // Update UI
            this.updateFinanceOverview();

            this.showNotification(`本月支出: $${totalExpenses.toLocaleString()}`, 'info');
        } else {
            this.showNotification('资金不足，无法支付本月支出', 'error');
        }

        // Save game state
        this.gameStateManager.saveGameState();
    }

    getRevenueSourceName(source) {
        const names = {
            ticketSales: '门票收入',
            merchandise: '商品销售',
            sponsorships: '赞助',
            broadcasting: '转播权',
            donations: '捐赠'
        };

        return names[source] || source;
    }

    getExpenseCategoryName(category) {
        const names = {
            coachSalary: '教练薪水',
            playerScholarships: '球员奖学金',
            travel: '差旅费',
            equipment: '装备费',
            facilities: '设施费'
        };

        return names[category] || category;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    calculateMonthlyRevenueTotal(userTeam) {
        const revenues = this.calculateMonthlyRevenues(userTeam);
        return Object.values(revenues).reduce((sum, amount) => sum + amount, 0);
    }

    calculateMonthlyExpenseTotal(userTeam) {
        const expenses = this.calculateMonthlyExpenses(userTeam);
        return Object.values(expenses).reduce((sum, amount) => sum + amount, 0);
    }

    calculateTeamValue(userTeam) {
        if (!userTeam) return 0;
        
        let rosterValue = 0;
        userTeam.roster.forEach(player => {
            rosterValue += player.getOverallRating() * 10000;
        });
        
        const baseValue = 5000000;
        const rosterMultiplier = 1.5;
        const coachBonus = userTeam.coach ? userTeam.coach.overallRating * 50000 : 0;
        
        return Math.round(baseValue + rosterValue * rosterMultiplier + coachBonus);
    }

    getBudgetStatus(userTeam) {
        if (!userTeam) return 'neutral';
        
        const funds = userTeam.funds || 0;
        const monthlyExpenses = this.calculateMonthlyExpenseTotal(userTeam);
        
        if (funds < monthlyExpenses) return 'negative';
        if (funds < monthlyExpenses * 3) return 'warning';
        return 'positive';
    }

    getBudgetStatusText(userTeam) {
        const status = this.getBudgetStatus(userTeam);
        const texts = {
            positive: '健康',
            warning: '紧张',
            negative: '危机',
            neutral: '未知'
        };
        return texts[status] || '未知';
    }
}