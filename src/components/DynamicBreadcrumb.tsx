'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowBigLeft } from 'lucide-react';
import { FiHome } from "react-icons/fi";

interface DynamicBreadcrumbProps {
  className?: string
  listClassName?: string
};

export default function DynamicBreadcrumb({ 
  className, 
  listClassName, 
}: DynamicBreadcrumbProps) {
  const router = useRouter();
  const paths = usePathname();

  const breadcrumbList = useMemo(() => {
    const segments = paths.split('/').filter(path => path.length > 0);
    return segments;
  }, [paths]);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={`text-zinc-200 ${listClassName}`}>
        {paths.localeCompare('/dashboard') === 0 ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink 
                aria-label="Voltar para a página inicial"
                title="Voltar para a página inicial"
                href={'/dashboard'}
                className="flex items-center"
              >
                <FiHome className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
          </>
        ) : (
          <>
            <BreadcrumbItem>
              <button 
                type="button"
                title="Voltar"
                aria-label="Voltar"
                onClick={() => router.back()} 
                className="flex items-center cursor-pointer hover:italic hover:underline hover:text-primary dark:hover:text-details transition-all gap-1" 
                disabled={breadcrumbList.length === 0}
                >
                <ArrowBigLeft className="w-4 h-4" />
                Voltar
              </button>
            </BreadcrumbItem>
          </>
        )}

        {breadcrumbList.map((link, index) => {
          const href = `/${breadcrumbList.slice(0, index + 1).join('/')}`;
          const isLast = index === breadcrumbList.length - 1;
          let formattedLink = link.charAt(0).toUpperCase() + link.slice(1).replace(/-/g, ' ');

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formattedLink}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>
                    {formattedLink}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};