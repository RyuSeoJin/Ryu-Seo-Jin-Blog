import styled from "@emotion/styled"
import Link from "next/link"

const NavBar: React.FC = () => {
  const links = [
    // /fx 는 Next 페이지가 아닌 정적 파일(public/fx)이라 일반 링크로 이동합니다.
    { id: 1, name: "FX", to: "/fx", external: true },
    { id: 2, name: "About", to: "/about" },
  ]
  return (
    <StyledWrapper className="">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            {link.external ? (
              <a href={link.to}>{link.name}</a>
            ) : (
              <Link href={link.to}>{link.name}</Link>
            )}
          </li>
        ))}
      </ul>
    </StyledWrapper>
  )
}

export default NavBar

const StyledWrapper = styled.div`
  flex-shrink: 0;
  ul {
    display: flex;
    flex-direction: row;
    li {
      display: block;
      margin-left: 1rem;
      color: ${({ theme }) => theme.colors.gray11};
    }
  }
`
