/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You might want to revise ' +
        'your solution (i.e. use dependency inversion, make sure the modules have a single responsibility). ' +
        'Note: Barrel exports (index.ts), Domain layer, and NestJS modules are excluded from this rule.',
      from: {
        pathNot: [
          // Exclude barrel exports from circular dependency detection
          '(^|/)index\\.ts$',
          // Allow circular dependencies within Domain layer (DDD pattern)
          // Value Objects, Entities, and Errors can reference each other
          '^src/domain/',
          // Exclude NestJS modules (they can have circular dependencies via forwardRef)
          '\\.module\\.ts$',
        ],
      },
      to: {
        circular: true,
        pathNot: [
          // Exclude barrel exports from circular dependency detection
          '(^|/)index\\.ts$',
          // Exclude NestJS modules
          '\\.module\\.ts$',
        ],
      },
    },
    {
      name: 'domain-no-external-deps',
      severity: 'error',
      comment:
        'Domain layer should not depend on anything external. It must remain pure business logic.',
      from: {
        path: '^src/domain',
      },
      to: {
        path: '^src/(application|infrastructure|presentation)',
      },
    },
    {
      name: 'domain-no-node-modules',
      severity: 'error',
      comment:
        'Domain layer should not import from node_modules (except TypeScript types if necessary).',
      from: {
        path: '^src/domain',
      },
      to: {
        path: 'node_modules',
        pathNot: [
          // Allow type-only imports from these packages if needed
          'node_modules/@types',
        ],
      },
    },
    {
      name: 'application-no-infrastructure-deps',
      severity: 'error',
      comment:
        'Application layer should only depend on Domain. It should not import from Infrastructure.',
      from: {
        path: '^src/application',
      },
      to: {
        path: '^src/infrastructure',
      },
    },
    {
      name: 'application-no-presentation-deps',
      severity: 'error',
      comment:
        'Application layer should only depend on Domain. It should not import from Presentation.',
      from: {
        path: '^src/application',
      },
      to: {
        path: '^src/presentation',
      },
    },
    {
      name: 'infrastructure-no-presentation-deps',
      severity: 'error',
      comment:
        'Infrastructure layer should not depend on Presentation layer.',
      from: {
        path: '^src/infrastructure',
      },
      to: {
        path: '^src/presentation',
      },
    },
    {
      name: 'presentation-no-infrastructure-deps',
      severity: 'warn',
      comment:
        'Presentation layer should ideally not import directly from Infrastructure. ' +
        'Use dependency injection through modules instead.',
      from: {
        path: '^src/presentation',
      },
      to: {
        path: '^src/infrastructure',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: [
        'node_modules',
        '\\.spec\\.ts$',
        '\\.e2e-spec\\.ts$',
        'test/',
        'dist/',
        'coverage/',
      ],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern:
          '^(src/domain|src/application|src/infrastructure|src/presentation)',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
