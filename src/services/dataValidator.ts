import { TaskData } from '@/data/projectData';
import { kpiErrorHandler, ErrorType, ErrorSeverity } from './errorHandler';

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    sanitizedData?: TaskData[];
}

export interface ValidationError {
    field: string;
    taskId?: number;
    message: string;
    severity: 'critical' | 'high' | 'medium';
    suggestedFix?: string;
}

export interface ValidationWarning {
    field: string;
    taskId?: number;
    message: string;
    suggestedAction?: string;
}

export interface ValidationConfig {
    allowFutureDates: boolean;
    maxTaskDuration: number; // em dias
    minTaskDuration: number; // em dias
    strictDateFormat: boolean;
    allowEmptyEndDates: boolean;
    maxDelayDays: number;
}

export class DataValidator {
    private config: ValidationConfig;

    constructor(config: Partial<ValidationConfig> = {}) {
        this.config = {
            allowFutureDates: true,
            maxTaskDuration: 365, // 1 ano
            minTaskDuration: 0.1, // 2.4 horas
            strictDateFormat: true,
            allowEmptyEndDates: true,
            maxDelayDays: 1000,
            ...config
        };
    }

    /**
     * Valida e sanitiza um array de dados de tarefas
     */
    validateAndSanitize(tasks: TaskData[]): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const sanitizedTasks: TaskData[] = [];

        // Validação inicial do array
        if (!Array.isArray(tasks)) {
            errors.push({
                field: 'tasks',
                message: 'Dados devem ser fornecidos como um array',
                severity: 'critical',
                suggestedFix: 'Forneça os dados como um array de tarefas'
            });
            return { isValid: false, errors, warnings };
        }

        if (tasks.length === 0) {
            warnings.push({
                field: 'tasks',
                message: 'Nenhuma tarefa fornecida para validação',
                suggestedAction: 'Adicione pelo menos uma tarefa para calcular KPIs'
            });
            return { isValid: true, errors, warnings, sanitizedData: [] };
        }

        // Valida cada tarefa individualmente
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const taskErrors: ValidationError[] = [];
            const taskWarnings: ValidationWarning[] = [];

            // Valida estrutura básica da tarefa
            const structureValidation = this.validateTaskStructure(task, i);
            taskErrors.push(...structureValidation.errors);
            taskWarnings.push(...structureValidation.warnings);

            // Se a estrutura básica está ok, continua com validações específicas
            if (structureValidation.errors.length === 0) {
                // Valida datas
                const dateValidation = this.validateDates(task);
                taskErrors.push(...dateValidation.errors);
                taskWarnings.push(...dateValidation.warnings);

                // Valida consistência entre datas
                const consistencyValidation = this.validateDateConsistency(task);
                taskErrors.push(...consistencyValidation.errors);
                taskWarnings.push(...consistencyValidation.warnings);

                // Valida valores numéricos
                const numericValidation = this.validateNumericFields(task);
                taskErrors.push(...numericValidation.errors);
                taskWarnings.push(...numericValidation.warnings);

                // Valida lógica de negócio
                const businessValidation = this.validateBusinessLogic(task);
                taskErrors.push(...businessValidation.errors);
                taskWarnings.push(...businessValidation.warnings);

                // Se não há erros críticos, sanitiza e adiciona a tarefa
                if (taskErrors.filter(e => e.severity === 'critical').length === 0) {
                    const sanitizedTask = this.sanitizeTask(task);
                    sanitizedTasks.push(sanitizedTask);
                }
            }

            errors.push(...taskErrors);
            warnings.push(...taskWarnings);
        }

        // Validações globais do conjunto de dados
        if (sanitizedTasks.length > 0) {
            const globalValidation = this.validateGlobalConsistency(sanitizedTasks);
            errors.push(...globalValidation.errors);
            warnings.push(...globalValidation.warnings);
        }

        // Registra erros no sistema de tratamento de erros
        errors.forEach(error => {
            const severity = error.severity === 'critical' ? ErrorSeverity.CRITICAL :
                error.severity === 'high' ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;

            kpiErrorHandler.createError(
                ErrorType.VALIDATION,
                severity,
                error.message,
                'DataValidator',
                { field: error.field, taskId: error.taskId, suggestedFix: error.suggestedFix }
            );
        });

        const isValid = errors.filter(e => e.severity === 'critical').length === 0;

        return {
            isValid,
            errors,
            warnings,
            sanitizedData: isValid ? sanitizedTasks : undefined
        };
    }

    /**
     * Valida a estrutura básica de uma tarefa
     */
    private validateTaskStructure(task: any, index: number): { errors: ValidationError[], warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Verifica se é um objeto
        if (typeof task !== 'object' || task === null) {
            errors.push({
                field: 'task',
                taskId: index,
                message: `Tarefa no índice ${index} não é um objeto válido`,
                severity: 'critical',
                suggestedFix: 'Forneça um objeto com as propriedades necessárias'
            });
            return { errors, warnings };
        }

        // Campos obrigatórios
        const requiredFields = ['id', 'tarefa', 'inicio', 'prazo'];
        for (const field of requiredFields) {
            if (!(field in task) || task[field] === null || task[field] === undefined) {
                errors.push({
                    field,
                    taskId: task.id || index,
                    message: `Campo obrigatório '${field}' está ausente ou nulo`,
                    severity: 'critical',
                    suggestedFix: `Adicione o campo '${field}' com um valor válido`
                });
            }
        }

        // Campos opcionais mas importantes
        const optionalFields = ['fim', 'duracaoDiasUteis', 'atrasoDiasUteis', 'atendeuPrazo'];
        for (const field of optionalFields) {
            if (!(field in task)) {
                warnings.push({
                    field,
                    taskId: task.id || index,
                    message: `Campo '${field}' não encontrado, será calculado automaticamente`,
                    suggestedAction: `Considere fornecer o campo '${field}' para melhor precisão`
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Valida formatos e valores de datas
     */
    private validateDates(task: TaskData): { errors: ValidationError[], warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const dateFields = ['inicio', 'fim', 'prazo'];

        for (const field of dateFields) {
            const dateValue = task[field as keyof TaskData] as string;

            // Permite datas vazias apenas para 'fim' se configurado
            if (!dateValue || dateValue.trim() === '') {
                if (field === 'fim' && this.config.allowEmptyEndDates) {
                    warnings.push({
                        field,
                        taskId: task.id,
                        message: `Data de fim está vazia - tarefa pode estar em andamento`,
                        suggestedAction: 'Atualize a data de fim quando a tarefa for concluída'
                    });
                    continue;
                } else if (field !== 'fim') {
                    errors.push({
                        field,
                        taskId: task.id,
                        message: `Data ${field} está vazia ou inválida`,
                        severity: 'critical',
                        suggestedFix: `Forneça uma data válida no formato YYYY-MM-DD`
                    });
                    continue;
                }
            }

            // Valida formato da data
            const dateFormatValidation = this.validateDateFormat(dateValue, field, task.id);
            if (dateFormatValidation.error) {
                errors.push(dateFormatValidation.error);
                continue;
            }

            // Valida se a data é válida
            const parsedDate = new Date(dateValue);
            if (isNaN(parsedDate.getTime())) {
                errors.push({
                    field,
                    taskId: task.id,
                    message: `Data ${field} '${dateValue}' não é uma data válida`,
                    severity: 'high',
                    suggestedFix: 'Use o formato YYYY-MM-DD com uma data válida'
                });
                continue;
            }

            // Valida datas futuras se não permitidas
            if (!this.config.allowFutureDates && parsedDate > new Date()) {
                warnings.push({
                    field,
                    taskId: task.id,
                    message: `Data ${field} está no futuro`,
                    suggestedAction: 'Verifique se a data está correta'
                });
            }

            // Valida datas muito antigas (mais de 10 anos)
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
            if (parsedDate < tenYearsAgo) {
                warnings.push({
                    field,
                    taskId: task.id,
                    message: `Data ${field} é muito antiga (mais de 10 anos)`,
                    suggestedAction: 'Verifique se a data está correta'
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Valida formato específico de data
     */
    private validateDateFormat(dateValue: string, field: string, taskId: number): { error?: ValidationError } {
        if (!this.config.strictDateFormat) {
            return {};
        }

        // Formato esperado: YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateValue)) {
            return {
                error: {
                    field,
                    taskId,
                    message: `Data ${field} '${dateValue}' não está no formato correto (YYYY-MM-DD)`,
                    severity: 'high',
                    suggestedFix: 'Use o formato YYYY-MM-DD (ex: 2024-01-15)'
                }
            };
        }

        return {};
    }

    /**
     * Valida consistência entre datas
     */
    private validateDateConsistency(task: TaskData): { errors: ValidationError[], warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const inicio = new Date(task.inicio);
        const fim = task.fim ? new Date(task.fim) : null;
        const prazo = new Date(task.prazo);

        // Valida se as datas são válidas antes de comparar
        if (isNaN(inicio.getTime()) || isNaN(prazo.getTime())) {
            return { errors, warnings }; // Erros de formato já foram capturados
        }

        // Data de início deve ser anterior ou igual ao prazo
        if (inicio > prazo) {
            errors.push({
                field: 'inicio',
                taskId: task.id,
                message: 'Data de início não pode ser posterior à data de prazo',
                severity: 'high',
                suggestedFix: 'Ajuste a data de início ou a data de prazo'
            });
        }

        // Se há data de fim, validações adicionais
        if (fim && !isNaN(fim.getTime())) {
            // Data de início deve ser anterior ou igual à data de fim
            if (inicio > fim) {
                errors.push({
                    field: 'fim',
                    taskId: task.id,
                    message: 'Data de início não pode ser posterior à data de fim',
                    severity: 'high',
                    suggestedFix: 'Ajuste a data de início ou a data de fim'
                });
            }

            // Verifica duração muito longa
            const durationMs = fim.getTime() - inicio.getTime();
            const durationDays = durationMs / (1000 * 60 * 60 * 24);

            if (durationDays > this.config.maxTaskDuration) {
                warnings.push({
                    field: 'fim',
                    taskId: task.id,
                    message: `Duração da tarefa (${Math.round(durationDays)} dias) é muito longa`,
                    suggestedAction: 'Verifique se as datas estão corretas ou considere dividir a tarefa'
                });
            }

            if (durationDays < this.config.minTaskDuration) {
                warnings.push({
                    field: 'fim',
                    taskId: task.id,
                    message: `Duração da tarefa (${durationDays.toFixed(1)} dias) é muito curta`,
                    suggestedAction: 'Verifique se as datas estão corretas'
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Valida campos numéricos
     */
    private validateNumericFields(task: TaskData): { errors: ValidationError[], warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Valida ID
        if (typeof task.id !== 'number' || !Number.isInteger(task.id) || task.id <= 0) {
            errors.push({
                field: 'id',
                taskId: task.id,
                message: 'ID deve ser um número inteiro positivo',
                severity: 'critical',
                suggestedFix: 'Use um número inteiro positivo único para o ID'
            });
        }

        // Valida duração em dias úteis
        if ('duracaoDiasUteis' in task) {
            if (typeof task.duracaoDiasUteis !== 'number' || isNaN(task.duracaoDiasUteis)) {
                errors.push({
                    field: 'duracaoDiasUteis',
                    taskId: task.id,
                    message: 'Duração em dias úteis deve ser um número válido',
                    severity: 'medium',
                    suggestedFix: 'Forneça um número válido ou remova o campo para cálculo automático'
                });
            } else if (task.duracaoDiasUteis < 0) {
                errors.push({
                    field: 'duracaoDiasUteis',
                    taskId: task.id,
                    message: 'Duração em dias úteis não pode ser negativa',
                    severity: 'medium',
                    suggestedFix: 'Use um valor positivo ou zero'
                });
            } else if (task.duracaoDiasUteis > this.config.maxTaskDuration) {
                warnings.push({
                    field: 'duracaoDiasUteis',
                    taskId: task.id,
                    message: `Duração muito longa: ${task.duracaoDiasUteis} dias`,
                    suggestedAction: 'Verifique se o valor está correto'
                });
            }
        }

        // Valida atraso em dias úteis
        if ('atrasoDiasUteis' in task) {
            if (typeof task.atrasoDiasUteis !== 'number' || isNaN(task.atrasoDiasUteis)) {
                errors.push({
                    field: 'atrasoDiasUteis',
                    taskId: task.id,
                    message: 'Atraso em dias úteis deve ser um número válido',
                    severity: 'medium',
                    suggestedFix: 'Forneça um número válido ou remova o campo para cálculo automático'
                });
            } else if (task.atrasoDiasUteis < 0) {
                warnings.push({
                    field: 'atrasoDiasUteis',
                    taskId: task.id,
                    message: 'Atraso negativo indica entrega antecipada',
                    suggestedAction: 'Verifique se o cálculo está correto'
                });
            } else if (task.atrasoDiasUteis > this.config.maxDelayDays) {
                warnings.push({
                    field: 'atrasoDiasUteis',
                    taskId: task.id,
                    message: `Atraso muito grande: ${task.atrasoDiasUteis} dias`,
                    suggestedAction: 'Verifique se o valor está correto'
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Valida lógica de negócio
     */
    private validateBusinessLogic(task: TaskData): { errors: ValidationError[], warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Valida nome da tarefa
        if (typeof task.tarefa !== 'string' || task.tarefa.trim().length === 0) {
            errors.push({
                field: 'tarefa',
                taskId: task.id,
                message: 'Nome da tarefa não pode estar vazio',
                severity: 'high',
                suggestedFix: 'Forneça um nome descritivo para a tarefa'
            });
        } else if (task.tarefa.length > 200) {
            warnings.push({
                field: 'tarefa',
                taskId: task.id,
                message: 'Nome da tarefa é muito longo (mais de 200 caracteres)',
                suggestedAction: 'Considere usar um nome mais conciso'
            });
        }

        // Valida consistência entre atendeuPrazo e atraso
        if ('atendeuPrazo' in task && 'atrasoDiasUteis' in task) {
            if (typeof task.atendeuPrazo === 'boolean' && typeof task.atrasoDiasUteis === 'number') {
                const shouldMeetDeadline = task.atrasoDiasUteis <= 0;
                if (task.atendeuPrazo !== shouldMeetDeadline) {
                    warnings.push({
                        field: 'atendeuPrazo',
                        taskId: task.id,
                        message: 'Inconsistência entre atendeuPrazo e atrasoDiasUteis',
                        suggestedAction: 'Verifique se os valores estão corretos'
                    });
                }
            }
        }

        return { errors, warnings };
    }

    /**
     * Valida consistência global do conjunto de dados
     */
    private validateGlobalConsistency(tasks: TaskData[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Verifica IDs duplicados
        const ids = tasks.map(t => t.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

        if (duplicateIds.length > 0) {
            const uniqueDuplicates = [...new Set(duplicateIds)];
            uniqueDuplicates.forEach(id => {
                errors.push({
                    field: 'id',
                    taskId: id,
                    message: `ID ${id} está duplicado`,
                    severity: 'critical',
                    suggestedFix: 'Use IDs únicos para cada tarefa'
                });
            });
        }

        // Verifica nomes de tarefas duplicados
        const taskNames = tasks.map(t => t.tarefa.trim().toLowerCase());
        const duplicateNames = taskNames.filter((name, index) => taskNames.indexOf(name) !== index);

        if (duplicateNames.length > 0) {
            warnings.push({
                field: 'tarefa',
                message: `Encontrados nomes de tarefas duplicados: ${duplicateNames.length} casos`,
                suggestedAction: 'Considere usar nomes únicos para facilitar identificação'
            });
        }

        // Verifica distribuição temporal das tarefas
        const validDates = tasks
            .filter(t => t.inicio && !isNaN(new Date(t.inicio).getTime()))
            .map(t => new Date(t.inicio));

        if (validDates.length > 1) {
            const sortedDates = validDates.sort((a, b) => a.getTime() - b.getTime());
            const firstDate = sortedDates[0];
            const lastDate = sortedDates[sortedDates.length - 1];
            const projectDurationMs = lastDate.getTime() - firstDate.getTime();
            const projectDurationDays = projectDurationMs / (1000 * 60 * 60 * 24);

            if (projectDurationDays > 1095) { // 3 anos
                warnings.push({
                    field: 'global',
                    message: `Projeto tem duração muito longa: ${Math.round(projectDurationDays)} dias`,
                    suggestedAction: 'Verifique se todas as datas estão corretas'
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Sanitiza uma tarefa, corrigindo problemas menores
     */
    private sanitizeTask(task: TaskData): TaskData {
        const sanitized = { ...task };

        // Limpa espaços em branco do nome da tarefa
        if (typeof sanitized.tarefa === 'string') {
            sanitized.tarefa = sanitized.tarefa.trim();
        }

        // Normaliza datas para formato ISO
        const dateFields: (keyof TaskData)[] = ['inicio', 'fim', 'prazo'];
        dateFields.forEach(field => {
            const dateValue = sanitized[field] as string;
            if (dateValue && dateValue.trim()) {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    // Converte para formato YYYY-MM-DD
                    (sanitized as any)[field] = date.toISOString().split('T')[0];
                }
            }
        });

        // Garante que valores numéricos sejam números
        if ('duracaoDiasUteis' in sanitized && sanitized.duracaoDiasUteis !== undefined) {
            sanitized.duracaoDiasUteis = Number(sanitized.duracaoDiasUteis);
        }

        if ('atrasoDiasUteis' in sanitized && sanitized.atrasoDiasUteis !== undefined) {
            sanitized.atrasoDiasUteis = Number(sanitized.atrasoDiasUteis);
        }

        // Garante que ID seja um número inteiro
        sanitized.id = Math.floor(Number(sanitized.id));

        return sanitized;
    }

    /**
     * Valida um único campo de uma tarefa
     */
    validateField(task: TaskData, field: keyof TaskData, value: any): ValidationResult {
        const mockTask = { ...task, [field]: value };
        return this.validateAndSanitize([mockTask]);
    }

    /**
     * Obtém configuração atual do validador
     */
    getConfig(): ValidationConfig {
        return { ...this.config };
    }

    /**
     * Atualiza configuração do validador
     */
    updateConfig(newConfig: Partial<ValidationConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

// Instância padrão do validador
export const dataValidator = new DataValidator();