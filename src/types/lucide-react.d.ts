declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = ComponentType<LucideProps>;
  
  // Ícones específicos que estamos usando
  export const Clock: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Database: LucideIcon;
  export const Zap: LucideIcon;
  export const History: LucideIcon;
  export const Activity: LucideIcon;
  export const Target: LucideIcon;
  export const BarChart3: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Loader2: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const User: LucideIcon;
  export const LogOut: LucideIcon;
  export const Settings: LucideIcon;
  export const Upload: LucideIcon;
  export const Save: LucideIcon;
  
  // Exportação padrão para todos os ícones
  const lucideReact: {
    [key: string]: LucideIcon;
  };
  
  export default lucideReact;
}