interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="gradient-primary text-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-white/70 text-lg">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
