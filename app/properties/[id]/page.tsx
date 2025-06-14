const PropertyPage = async ( { params }: {params: Promise<{ id: string }>}) => {
    const { id } = await params;
    return (
        <main>
            <div>Property Page for {id}</div>
        </main>
    );
}
 
export default PropertyPage;