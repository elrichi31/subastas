import Link from 'next/link'
import { Button } from "@/components/ui/button"

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    userName: string
    userLastName: string
    userId: string
    children?: ReactNode
}

export function Navbar({ userName, userLastName, children, userId }: NavbarProps) {
    const router = useRouter();

    const handleMyAuctions = () => {
        router.push(`/my-auctions?userId=${userId}`);
    }

    const handleAuctions = () => {
        router.push(`/auctions?userId=${userId}`);
    }

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold text-gray-800">
                            Subasta App
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" className="text-gray-600">
                            {userName} {userLastName}
                        </Button>
                        <Button variant="ghost" className="text-gray-600" onClick={handleMyAuctions}>
                            Mis subastas
                        </Button>
                        <Button variant="ghost" className="text-gray-600" onClick={handleAuctions}>
                            Subastas
                        </Button>
                    </div>
                </div>
                {children}
            </div>
        </nav>
    )
}

