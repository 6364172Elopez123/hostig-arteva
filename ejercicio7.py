poriginal=input("Introduce el precio original del producto: ")
poriginal=float(poriginal);
descuento=input("Introduce el porcentaje de descuento: ")
descuento=float(descuento);


proseso1=poriginal*descuento/100;
proseso2=poriginal-proseso1;
respuesta=proseso2
print("El precio final del producto es: ", round(respuesta, 2));