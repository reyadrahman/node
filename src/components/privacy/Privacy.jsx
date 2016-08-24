import React from 'react';


let Privacy = React.createClass({
    render() {
        const { children, styles, styles: { form: ss }, className,
            onSubmit, buttons } = this.props;
        return <div className={`${ss.root} ${className || ''}`}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas non sapien ligula. Etiam massa odio,
            condimentum a sapien non, interdum vestibulum sem. Sed pharetra sapien tellus, sed pulvinar risus aliquet
            ac. Integer gravida cursus diam, ac interdum eros tincidunt sit amet. Suspendisse in feugiat tortor. Morbi
            ex turpis, fermentum non lectus eget, interdum mollis velit. Donec in tincidunt nisl. Nullam ultrices ante
            non nisi tincidunt, rhoncus efficitur massa egestas.

            Morbi rutrum, nunc ac lacinia efficitur, nisi eros blandit tellus, quis suscipit massa tellus at mi. Quisque
            sagittis urna at sapien hendrerit, imperdiet euismod nulla euismod. Aliquam erat volutpat. Class aptent
            taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur eget mauris
            molestie, luctus metus eu, fringilla purus. Aliquam id nunc et augue sagittis elementum. Suspendisse
            potenti. Cras sodales justo nunc, a aliquam leo maximus at.

            Maecenas blandit et quam sit amet accumsan. Sed in risus auctor, sagittis quam in, pretium lectus. Mauris
            sed pharetra metus, venenatis lobortis nunc. Fusce malesuada mattis rutrum. Quisque et rhoncus erat. Aliquam
            erat volutpat. Praesent ut sapien ex. Duis rutrum maximus magna, et pretium lectus pellentesque eget.
            Vivamus est odio, interdum ac cursus a, posuere at arcu. Proin molestie nisl eget est luctus egestas. Duis
            non mauris odio.

            Nullam sagittis quis tellus ut maximus. Integer non gravida nisi. Etiam sed viverra diam. Phasellus id
            pharetra nisl. Pellentesque interdum luctus dui. In hac habitasse platea dictumst. Sed eu scelerisque urna.
            Nullam molestie volutpat facilisis. Vivamus nec facilisis massa. Nullam non tincidunt neque, faucibus
            tincidunt nisl. Nulla at magna non purus placerat rutrum eu sed enim.

            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed volutpat
            tincidunt pretium. Nunc volutpat nunc lacus, quis semper lorem finibus eget. Quisque mattis arcu sed sapien
            interdum lobortis. Vivamus aliquam odio elit, vel auctor leo scelerisque id. Maecenas ut dui turpis.
            Vestibulum quis ligula interdum, molestie diam imperdiet, scelerisque felis. Vivamus id condimentum tellus.
            Fusce non odio ipsum. In imperdiet pretium tortor, eget sagittis ipsum tempus ut. Nulla accumsan sagittis
            laoreet. Etiam lectus urna, consectetur eu quam a, suscipit malesuada lorem. Praesent vel nisl in tellus
            dignissim pretium.</div>
    }
})

export default Privacy;