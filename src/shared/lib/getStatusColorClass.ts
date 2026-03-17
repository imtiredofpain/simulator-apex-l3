/**
 *Возвращает имя класса Tailwindcss, соответствующее цвету кода состояния.
 *
 *Функция принимает код состояния в качестве аргумента и возвращает имя класса, которое можно использовать для стилизации элемента.
 *
 *Коды состояния разделены на семейства по 100, и каждому семейству соответствует соответствующий цветовой класс попутного ветра.
 *
 *Функция использует функцию Math.floor() для деления кода состояния на 100 и получения номера семьи.
 *
*Затем функция использует оператор переключения для возврата соответствующего имени класса Tailwindcss.
 *
 *Если код состояния не попадает ни в одно из вышеперечисленных семейств, функция по умолчанию возвращает «text-muted-foreground».
 */
function getStatusColorClass(code: number): string {
  const family = Math.floor(code / 100);
  switch (family) {
    case 1:
      return "text-slate-400";
    case 2:
      return "text-emerald-500";
    case 3:
      return "text-sky-500";
    case 4:
      return "text-amber-500";
    case 5:
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

export default getStatusColorClass;