import Image from "next/image";

export function UnderConstruction() {
    return (
        <main>
            <Image
                alt="Under Construction"
                className="h-[80%] w-[60%] m-auto mix-blend-luminosity"
                height={300}
                priority
                src="/under_construction.svg"
                width={400}
            />
        </main>
    );
}
