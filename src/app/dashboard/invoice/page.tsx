import Image from "next/image";

export default function TempPage() {
    return (
        <main>
            <Image
                className="h-[80%] w-[60%] m-auto mix-blend-luminosity"
                src="/under_construction.svg"
                alt="Under Construction"
                width={400}
                height={300}
                priority
            />
        </main>
    );
}
