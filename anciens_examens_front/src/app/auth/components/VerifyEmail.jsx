import emailSent from '@/assets/email_sent.png'


export default function VerifyEmail() {
    return (
        <div className="pt-6 pb-10 md:px-12 px-6">
        <div className="bg-white flex md:flex-row flex-col-reverse gap-12 justify-center shadow rounded-xl p-4 w-fit h-fit mx-auto">
            <div className="flex flex-col gap-12 p-4">
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-center py-6">Entrer le code envoyé</h2>
                    <p className="text-gray-700">Un code à 6 caractères a été envoyé à <span className="text-blue-400">user.email</span></p>
                </div>
                <form method="post" className="md:w-[400px] flex flex-col gap-4">
                     <div className="flex flex-col gap-3">
                        <label className="font-medium text-gray-700">Entrer le code :</label>
                        <input type="text" className="rounded-lg text-xl border-gray-300 font-semibold" />
                     </div>
                    {/* <p className="text-gray-700">{{ message_error }}</p> */}
                    <button type="submit" className="bg-gray-600 font-semibold text-white mx-auto py-3 px-8 rounded-lg shadow hover:bg-gray-700 transition-all duration-300 ease-in-out">
                        Valider
                    </button>
                </form>
            </div>
            <div className="bg-white h-[450px] md:w-1/2">
                <img
                    className="h-full rounded-lg object-cover"
                    src={emailSent}
                />
            </div>
        </div>
    </div>
    );
}