import "@/app/globals.css";

const LoginLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <html>
        <body>
            {/* <div className="flex-grow md:overflow-y-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8"> */}
                {children}
            {/* </div> */}
        </body>
    </html>
);

export default LoginLayout;