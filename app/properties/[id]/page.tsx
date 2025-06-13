const PropertyPage = async ( { params }: {params: Promise<{ id: string }>}) => {
    const { id } = await params;
    return (
        <div>Property Page for {id}</div>
    );
}
 
export default PropertyPage;