import emailSentImage from '@/assets/email_sent.jpg';
import { Link } from 'react-router-dom';


export default function ResetPasswordDone () {
    return (
        <div className="flex flex-col items-center py-12 gap-3 px-10">
            <div className="flex flex-col gap-6 items-center md:w-[700px]">
                <h1 className="text-5xl font-semibold text-gray-700">
                    Email envoyé !!!
                </h1>
                <p className="text-center font-medium text-gray-600">
                    Nous vous avons envoyé un email à l'adresse entré. <br/>
                    Veuillez consulter votre boite d'email<br/>
                    Si vous ne recevez pas d'email, consulter vos spams.
                </p>
                <Link
                  to="/connexion"
                  className="block w-fit px-6 text-center bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Retour à la connexion
                </Link>
            </div>
            <img 
                src={emailSentImage}
                className="w-1/2 mx-auto h-[260px] object-cover"
            />
        </div>
    )
}