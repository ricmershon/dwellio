import Link from "next/link";

interface Breadcrumb {
    label: string;
    href: string;
    active?: boolean;
}

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: Array<Breadcrumb> }) => (
    <nav aria-label="Breadcrumb" className="mb-6 block">
        <ol className="flex text-lg md:text-xl">
            {breadcrumbs.map((breadcrumb, index) => (
                <li
                    key={breadcrumb.href}
                    aria-current={breadcrumb.active}
                    className={`${breadcrumb.active ? "pointer-events-none" : "text-gray-400"}`}
                >
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                    {index < breadcrumbs.length - 1 ? (
                        <span className="mx-2 inline-block">/</span>
                    ) : null}
                </li>
            ))}
        </ol>
    </nav>
);

  export default Breadcrumbs;