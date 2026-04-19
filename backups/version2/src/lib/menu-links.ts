import { 
  LayoutDashboard, Image, Users, Cpu, Wrench, Shield, BarChart3, 
  Settings, Bell, Mail, FileText, Database, Globe, HelpCircle,
  ShoppingBag, Star, Crown, Gift, Map, Compass, Calendar, 
  Clock, Camera, Heart, Share2, MessageSquare, Briefcase,
  Zap, Activity, PieChart, Layers, Box, Truck, CreditCard,
  DollarSign, Percent, TrendingUp, Info, LifeBuoy, Terminal,
  Code, Command, Key, Lock, Eye, Monitor, Search, Hammer, RefreshCcw
} from 'lucide-react';

export const GENERAL_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'why', label: 'Overview' },
  { id: 'retail', label: 'Retail' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'dining', label: 'Dining' },
  { id: 'attractions', label: 'Attractions' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'experience', label: 'Scrapbook' },
  { id: 'events', label: 'Events' },
  { id: 'wow', label: '5 Facts' },
];

export const PREMIUM_LINKS = [
  ...GENERAL_LINKS,
  { id: 'concierge', label: 'Luxury Concierge' },
  { id: 'personal-shopper', label: 'Personal Shopper' },
  { id: 'vip-lounge', label: 'VIP Lounge Access' },
  { id: 'valet-booking', label: 'Premier Valet' },
  { id: 'private-viewing', label: 'Private Viewing' },
  { id: 'yacht-charters', label: 'Yacht Charters' },
  { id: 'helicopter-tours', label: 'Sky Tours' },
  { id: 'exclusive-events', label: 'Members Events' },
  { id: 'loyalty-status', label: 'Diamond Status' },
  { id: 'chauffeur', label: 'Chauffeur Service' },
  { id: 'spa-retreat', label: 'Private Spa' },
  { id: 'personal-stylist', label: 'Master Stylist' },
  { id: 'art-consulting', label: 'Art Advisory' },
  { id: 'wine-tasting', label: 'Exclusive Cellar' },
  { id: 'cigar-lounge', label: 'Heritage Lounge' },
  { id: 'tailoring', label: 'Bespoke Tailoring' },
  { id: 'gift-concierge', label: 'Premier Gifting' },
  { id: 'priority-booking', label: 'Table Priority' },
  { id: 'suite-access', label: 'Luxury Suites' },
  { id: 'wellness-center', label: 'Elite Wellness' },
  { id: 'butler-service', label: 'Private Butler' },
  { id: 'jewelry-cleaning', label: 'Jewelry Care' },
  { id: 'perfume-lab', label: 'Custom Perfume' },
  { id: 'watch-atelier', label: 'Watch Atelier' },
  { id: 'interior-design', label: 'Home Advisory' },
  { id: 'travel-expert', label: 'Global Travel' },
  { id: 'limousine', label: 'Executive Limo' },
  { id: 'pet-spa', label: 'Luxury Pet Care' },
  { id: 'flower-atelier', label: 'Floral Design' },
  { id: 'tech-support', label: 'Personal Tech' },
];

// 100 Admin Links (categorized for sidebar)
export const ADMIN_CATEGORIES = [
  {
    title: 'Management',
    links: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/users', label: 'User Control', icon: Users },
      { href: '/admin/roles', label: 'Role Editor', icon: Shield },
      { href: '/admin/stores', label: 'Store Manager', icon: ShoppingBag },
      { href: '/admin/inventory', label: 'Stock Audit', icon: Box },
      { href: '/admin/pricing', label: 'Global Pricing', icon: DollarSign },
      { href: '/admin/discounts', label: 'Campaigns', icon: Percent },
      { href: '/admin/vendors', label: 'Suppliers', icon: Truck },
      { href: '/admin/contracts', label: 'Legal Docs', icon: FileText, status: 'coming_soon' },
      { href: '/admin/leases', label: 'Lease Tracking', icon: Key },
    ]
  },
  {
    title: 'Content',
    links: [
      { href: '/admin/gallery', label: 'Media Library', icon: Image },
      { href: '/admin/gallery-tools', label: 'AI Optimizer', icon: Wrench },
      { href: '/admin/experiences', label: 'Experience Hub', icon: Star },
      { href: '/admin/feedback', label: 'User Voice', icon: MessageSquare },
      { href: '/admin/pages', label: 'CMS Editor', icon: Monitor },
      { href: '/admin/blogs', label: 'Press Releases', icon: FileText },
      { href: '/admin/events', label: 'Event Planner', icon: Calendar },
      { href: '/admin/announcements', label: 'Broadcaster', icon: Bell },
      { href: '/admin/faq', label: 'Knowledge Base', icon: HelpCircle },
      { href: '/admin/seo', label: 'SEO Manager', icon: Search, status: 'coming_soon' },
    ]
  },
  {
    title: 'Analytics',
    links: [
      { href: '/admin/ai-usage', label: 'AI Performance', icon: Cpu },
      { href: '/admin/api-manager', label: 'API Intelligence', icon: Zap },
      { href: '/admin/traffic', label: 'Visitor Stats', icon: Activity },
      { href: '/admin/sales', label: 'Revenue Report', icon: TrendingUp },
      { href: '/admin/heatmaps', label: 'Floor Traffic', icon: Map },
      { href: '/admin/demographics', label: 'Audience Insight', icon: PieChart },
      { href: '/admin/retention', label: 'Churn Analysis', icon: Users },
      { href: '/admin/conversions', label: 'Goal Tracking', icon: BarChart3 },
      { href: '/admin/realtime', label: 'Live Monitor', icon: Eye },
      { href: '/admin/projections', label: 'Forecasts', icon: TrendingUp, status: 'coming_soon' },
      { href: '/admin/custom-reports', label: 'Report Builder', icon: FileText },
    ]
  },
  {
    title: 'Operations',
    links: [
      { href: '/admin/security', label: 'Security Portal', icon: Shield },
      { href: '/admin/logs', label: 'System Logs', icon: Terminal },
      { href: '/admin/maintenance', label: 'Work Orders', icon: Hammer },
      { href: '/admin/staff', label: 'HR Directory', icon: Users },
      { href: '/admin/shifts', label: 'Duty Roster', icon: Clock },
      { href: '/admin/comms', label: 'Internal Mail', icon: Mail },
      { href: '/admin/tickets', label: 'Support Desk', icon: LifeBuoy, status: 'coming_soon' },
      { href: '/admin/surveys', label: 'Research', icon: Activity },
      { href: '/admin/compliance', label: 'Audit Compliance', icon: Lock },
    ]
  },
  {
    title: 'Infrastructure',
    links: [
      { href: '/admin/sync', label: 'Sync Scheduler', icon: RefreshCcw },
      { href: '/admin/database', label: 'DB Health', icon: Database },
      { href: '/admin/backups', label: 'Snapshots', icon: Shield },
      { href: '/admin/api', label: 'API Keys', icon: Key },
      { href: '/admin/webhooks', label: 'Integrations', icon: Zap },
      { href: '/admin/settings', label: 'Global Config', icon: Settings },
      { href: '/admin/hosting', label: 'Cloud Status', icon: Globe },
      { href: '/admin/cdn', label: 'Edge Nodes', icon: Zap, status: 'coming_soon' },
      { href: '/admin/ssl', label: 'Certificates', icon: Lock },
      { href: '/admin/monitoring', label: 'Uptime', icon: Activity },
      { href: '/admin/terminal', label: 'Console', icon: Terminal },
    ]
  },
  {
    title: 'Financials',
    links: Array.from({ length: 10 }, (_, i) => ({
      href: `/admin/finance-${i}`,
      label: `Financial Module ${i + 1}`,
      icon: DollarSign,
      status: i === 9 ? 'coming_soon' : undefined
    }))
  },
  {
    title: 'Marketing',
    links: Array.from({ length: 10 }, (_, i) => ({
      href: `/admin/marketing-${i}`,
      label: `Marketing Campaign ${i + 1}`,
      icon: TrendingUp,
      status: i === 9 ? 'coming_soon' : undefined
    }))
  },
  {
    title: 'Retailer Tools',
    links: Array.from({ length: 35 }, (_, i) => ({
      href: `/admin/retailer-${i}`,
      label: `Retailer Interface ${i + 1}`,
      icon: ShoppingBag,
      status: i === 34 ? 'coming_soon' : undefined
    }))
  },
  {
    title: 'Custom Modules',
    links: Array.from({ length: 35 }, (_, i) => ({
      href: `/admin/custom-${i}`,
      label: `Custom Module ${i + 1}`,
      icon: Code,
      status: i === 34 ? 'coming_soon' : undefined
    }))
  },
  {
    title: 'Advanced Settings',
    links: Array.from({ length: 10 }, (_, i) => ({
      href: `/admin/advanced-${i}`,
      label: `Advanced Config ${i + 1}`,
      icon: Settings,
      status: i === 9 ? 'coming_soon' : undefined
    }))
  }
];

export const ALL_ADMIN_LINKS = ADMIN_CATEGORIES.flatMap(c => c.links);
