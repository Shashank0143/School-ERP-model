/**
 * StaffExtensionRegistry
 * 
 * Central registry for all modules that extend the Staff Workspace.
 * Redesigned to decouple registrations into logical features (Sidebar, Widgets, Actions)
 * and resolve visibility via a robust capabilities and lifecycle matrix.
 */
class StaffExtensionRegistry {
  constructor() {
    if (StaffExtensionRegistry.instance) {
      return StaffExtensionRegistry.instance;
    }
    this._extensions = new Map();
    this._sidebars = new Map();
    this._widgets = new Map();
    this._quickActions = new Map();
    StaffExtensionRegistry.instance = this;
  }

  /**
   * Evaluates if a given item (extension, widget, etc.) is visible to the current employee/user context
   */
  _evaluateVisibility(visibilityRules, staffContext) {
    if (!visibilityRules) return true;

    const { capabilities = [], permissions = [], lifecycle = [] } = visibilityRules;

    // Check capabilities (e.g. ACADEMIC, OPERATIONAL)
    if (capabilities.length > 0) {
      const hasCapability = capabilities.some(cap => staffContext.capabilities?.includes(cap));
      if (!hasCapability) return false;
    }

    // Check permissions (e.g. VIEW_ACADEMIC_RECORDS)
    if (permissions.length > 0) {
      const hasPermission = permissions.some(p => staffContext.viewerPermissions?.includes(p));
      if (!hasPermission) return false;
    }

    // Check lifecycle (e.g. ACTIVE, SUSPENDED)
    if (lifecycle.length > 0) {
      const isAllowedLifecycle = lifecycle.includes(staffContext.status?.toUpperCase());
      if (!isAllowedLifecycle) return false;
    }

    return true;
  }

  /**
   * Register a new extension (base module).
   */
  registerExtension(config) {
    if (!config.id || !config.route || !config.component) {
      throw new Error("StaffExtensionRegistry: id, route, and component are required.");
    }
    this._extensions.set(config.id, {
      visibilityRules: {},
      ...config
    });
  }

  /**
   * Register a sidebar link for an extension.
   */
  registerSidebar(extId, config) {
    if (!this._extensions.has(extId)) throw new Error(`Extension ${extId} not found.`);
    this._sidebars.set(extId, { extId, ...config });
  }

  /**
   * Register an overview widget.
   */
  registerWidget(extId, config) {
    if (!config.id || !config.component) throw new Error("Widget must have id and component.");
    if (!this._widgets.has(extId)) this._widgets.set(extId, []);
    this._widgets.get(extId).push({ extId, ...config });
  }

  /**
   * Register a quick action (header button).
   */
  registerQuickAction(extId, config) {
    if (!this._quickActions.has(extId)) this._quickActions.set(extId, []);
    this._quickActions.get(extId).push({ extId, ...config });
  }

  /**
   * Get extensions that the current context can access.
   */
  getExtensionsForEmployee(staffContext) {
    return Array.from(this._extensions.values())
      .filter((ext) => this._evaluateVisibility(ext.visibilityRules, staffContext));
  }

  /**
   * Get sidebar links for the current context.
   */
  getSidebarLinks(staffContext) {
    const validExts = this.getExtensionsForEmployee(staffContext).map(e => e.id);
    return Array.from(this._sidebars.values())
      .filter(sidebar => validExts.includes(sidebar.extId))
      .filter(sidebar => this._evaluateVisibility(sidebar.visibilityRules, staffContext))
      .sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  /**
   * Get overview widgets for the current context.
   */
  getWidgets(staffContext) {
    const validExts = this.getExtensionsForEmployee(staffContext).map(e => e.id);
    const widgets = [];
    this._widgets.forEach((extWidgets, extId) => {
      if (validExts.includes(extId)) {
        widgets.push(
          ...extWidgets.filter(w => this._evaluateVisibility(w.visibilityRules, staffContext))
        );
      }
    });
    return widgets.sort((a, b) => (a.order || 99) - (b.order || 99));
  }
}

const registry = new StaffExtensionRegistry();
export default registry;
