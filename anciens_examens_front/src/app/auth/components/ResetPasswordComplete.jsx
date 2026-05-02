import { Link } from "react-router-dom";


export default function ResetPasswordComplete () {
    return (
        <div class="flex flex-col h-screen justify-center items-center py-20 gap-3 px-10">
            <div class="flex flex-col gap-6 items-center md:w-[700px]">
                <h1 class="text-5xl font-semibold text-gray-700">
                    Mot de passe changé !!!
                </h1>
                <p class="text-center font-medium text-gray-600">
                    Votre mot de passe a été changé. Vous pouvez maintenant vous connecter.
                </p>
                <Link
                  to="/connexion"
                  className="block w-fit px-6 text-center bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Retour à la connexion
                </Link>
            </div>
        </div>
    )
}