import { getItem, setItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";

/**
 * leavePortfolioProvider.js
 * Dumb persistence layer for Leave Types Master Data.
 * Contains no business logic or validations.
 */

class LeavePortfolioProvider {
  getLeavePortfolios() {
    return getItem(STORAGE_KEYS.LEAVE_PORTFOLIOS) || [];
  }

  createLeavePortfolio(data) {
    const portfolios = this.getLeavePortfolios();
    const newPortfolio = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    portfolios.push(newPortfolio);
    setItem(STORAGE_KEYS.LEAVE_PORTFOLIOS, portfolios);
    return newPortfolio;
  }

  updateLeavePortfolio(id, data) {
    const portfolios = this.getLeavePortfolios();
    const index = portfolios.findIndex(p => p.leaveTypeId === id);
    if (index === -1) {
      throw new Error(`Leave Portfolio with id ${id} not found`);
    }
    
    portfolios[index] = {
      ...portfolios[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    setItem(STORAGE_KEYS.LEAVE_PORTFOLIOS, portfolios);
    return portfolios[index];
  }
}

export const leavePortfolioProvider = new LeavePortfolioProvider();
export default leavePortfolioProvider;
