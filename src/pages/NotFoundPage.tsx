import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-800">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-gray-600">Page not found</p>

      <Link
        to="/"
        className="mt-8 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
