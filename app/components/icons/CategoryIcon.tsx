'use client';

import {
  Zap,
  Shield,
  Search,
  Accessibility,
  Code,
  Globe,
  Smartphone,
  AlertTriangle,
  FileText,
  Image,
  Clock,
  Link,
  Database,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

export type CategoryType =
  | 'performance'
  | 'security'
  | 'seo'
  | 'accessibility'
  | 'codeQuality'
  | 'protocol'
  | 'pwa'
  | 'vulnerabilities'
  | 'structuredData'
  | 'images'
  | 'caching'
  | 'redirects'
  | 'links';

export type StatusType = 'success' | 'warning' | 'error';

interface CategoryIconProps {
  category: CategoryType;
  className?: string;
  size?: number;
}

interface StatusIconProps {
  status: StatusType;
  className?: string;
  size?: number;
}

const categoryIcons: Record<CategoryType, LucideIcon> = {
  performance: Zap,
  security: Shield,
  seo: Search,
  accessibility: Accessibility,
  codeQuality: Code,
  protocol: Globe,
  pwa: Smartphone,
  vulnerabilities: AlertTriangle,
  structuredData: FileText,
  images: Image,
  caching: Clock,
  redirects: Link,
  links: Link,
};

const statusIcons: Record<StatusType, LucideIcon> = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const statusColors: Record<StatusType, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
};

export function CategoryIcon({ category, className = '', size = 20 }: CategoryIconProps) {
  const Icon = categoryIcons[category] || Database;
  return <Icon className={`${className}`} size={size} />;
}

export function StatusIcon({ status, className = '', size = 16 }: StatusIconProps) {
  const Icon = statusIcons[status];
  return <Icon className={`${statusColors[status]} ${className}`} size={size} />;
}

// Priority icons for fix lists
export type PriorityType = 'critical' | 'high' | 'medium' | 'low';

interface PriorityIconProps {
  priority: PriorityType;
  className?: string;
  size?: number;
}

const priorityColors: Record<PriorityType, string> = {
  critical: 'text-danger',
  high: 'text-warning',
  medium: 'text-primary',
  low: 'text-gray-400',
};

export function PriorityIcon({ priority, className = '', size = 16 }: PriorityIconProps) {
  return <AlertCircle className={`${priorityColors[priority]} ${className}`} size={size} />;
}

// Effort icons
export type EffortType = 'quick' | 'medium' | 'significant';

interface EffortIconProps {
  effort: EffortType;
  className?: string;
  size?: number;
}

export function EffortIcon({ effort, className = '', size = 16 }: EffortIconProps) {
  const effortConfig = {
    quick: { icon: Zap, color: 'text-success' },
    medium: { icon: Clock, color: 'text-warning' },
    significant: { icon: Wrench, color: 'text-danger' },
  };
  const config = effortConfig[effort];
  const Icon = config.icon;
  return <Icon className={`${config.color} ${className}`} size={size} />;
}

// Export icon components for direct use
export { Zap, Shield, Search, Accessibility, Code, Globe, Smartphone, AlertTriangle, FileText, Image, Clock, Link as LinkIcon, Wrench, CheckCircle, XCircle, AlertCircle };
