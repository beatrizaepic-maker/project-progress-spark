import React from 'react';
import { AlertTriangle, XCircle, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPIError, ErrorSeverity, ErrorUtils } from '@/services/errorHandler';

interface ErrorDisplayProps {
  errors: KPIError[];
  onRetry?: () => void;
  onDismiss?: (errorId: string) => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  onRetry,
  onDismiss,
  showDetails = false,
  className
}) => {
  if (!errors || errors.length === 0) return null;

  const getErrorIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return <XCircle className="h-4 w-4" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="h-4 w-4" />;
      case ErrorSeverity.MEDIUM:
        return <AlertCircle className="h-4 w-4" />;
      case ErrorSeverity.LOW:
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getErrorVariant = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'destructive';
      case ErrorSeverity.MEDIUM:
        return 'default';
      case ErrorSeverity.LOW:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case ErrorSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ErrorSeverity.LOW:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filtra apenas erros que devem ser mostrados ao usuário
  const visibleErrors = errors.filter(ErrorUtils.shouldShowToUser);

  if (visibleErrors.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {visibleErrors.map((error) => (
        <Alert
          key={error.id}
          variant={getErrorVariant(error.severity)}
          className="relative"
        >
          <div className="flex items-start space-x-3">
            {getErrorIcon(error.severity)}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <AlertTitle className="flex items-center gap-2">
                  {ErrorUtils.createUserFriendlyMessage(error)}
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', getSeverityColor(error.severity))}
                  >
                    {error.severity}
                  </Badge>
                </AlertTitle>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(error.id)}
                    className="h-6 w-6 p-0"
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {error.details && showDetails && (
                <AlertDescription className="text-sm text-muted-foreground">
                  {error.details}
                </AlertDescription>
              )}

              {error.actionSuggestions && error.actionSuggestions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sugestões:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {error.actionSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showDetails && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>Erro ID: {error.id}</p>
                  <p>Timestamp: {error.timestamp.toLocaleString('pt-BR')}</p>
                  {error.context && (
                    <p>Contexto: {JSON.stringify(error.context, null, 2)}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {onRetry && error.recoverable && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Tentar Novamente
              </Button>
            </div>
          )}
        </Alert>
      ))}
    </div>
  );
};

interface ErrorSummaryProps {
  errorCount: number;
  criticalErrors: boolean;
  onViewDetails?: () => void;
  className?: string;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errorCount,
  criticalErrors,
  onViewDetails,
  className
}) => {
  if (errorCount === 0) return null;

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg border',
      criticalErrors 
        ? 'bg-red-50 border-red-200 text-red-800' 
        : 'bg-yellow-50 border-yellow-200 text-yellow-800',
      className
    )}>
      <div className="flex items-center gap-2">
        {criticalErrors ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {errorCount} {errorCount === 1 ? 'erro detectado' : 'erros detectados'}
          {criticalErrors && ' (incluindo erros críticos)'}
        </span>
      </div>
      
      {onViewDetails && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="text-current hover:bg-current/10"
        >
          Ver Detalhes
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;