import Link from "next/link";

const notfound = () => {
    return ( <div className="flex flex-col items-center justify-center gap-4 py-10">
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-4xl font-extrabold tracking-tighter">404</span>
      <h1 className="text-2xl font-extrabold tracking-tighter">Uh oh. I think you&apos;re lost.</h1>
      <p className="max-w-[500px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
        It looks like the page you&apos;re searching for doesn&apos;t exist.
      </p>
    </div>
    <Link
      className="btn"
      href="/"
    >
      Back to the Home
    </Link>
  </div>);
}
 
export default notfound;