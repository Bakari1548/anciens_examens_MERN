import emailSentImage from '@/assets/email_sent.jpg';


export default function ResetPasswordDone () {
    return (
        <div className="flex flex-col items-center py-20 gap-3 px-10">
            <div className="flex flex-col gap-6 items-center md:w-[700px]">
                <h1 className="text-5xl font-semibold text-gray-700">
                    Email envoyé !!!
                </h1>
                <p className="text-center font-medium text-gray-600">
                    Nous vous avons envoyé un email à l'adresse entré. <br/>
                    Veuillez consulter votre boite d'email<br/>
                    Si vous ne recevez pas d'email, consulter vos spams.
                </p>
                <p className="text-center">
                </p>
            </div>
            <img 
                src={emailSentImage}
                className="w-3/4 mx-auto h-[400px] object-cover"
            />
        </div>
    )
}